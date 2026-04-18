// =============================================================================
// Sentinel AI — Native Android App Install Monitor (Capacitor Plugin)
// =============================================================================
// LOCATION: Place this file at:
//   android/app/src/main/java/app/lovable/sentinel/SentinelInstallMonitor.kt
//
// HOW IT WORKS:
//   1. Registers a BroadcastReceiver for android.intent.action.PACKAGE_ADDED
//   2. When ANY app is installed on the device, Android fires the broadcast
//   3. We inspect installerPackageName (Play Store vs unknown), check the
//      app name for risky keywords, then:
//        a) Post a system notification immediately
//        b) Forward an event to the Capacitor JS bridge so the React UI updates
//
// REQUIRED MANIFEST CHANGES — add to android/app/src/main/AndroidManifest.xml:
//
//   <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
//       tools:ignore="QueryAllPackagesPermission" />
//   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
//   <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
//   <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
//
//   Inside <application>:
//   <receiver
//       android:name=".PackageInstallReceiver"
//       android:exported="true"
//       android:permission="android.permission.BROADCAST_PACKAGE_REMOVED">
//       <intent-filter android:priority="999">
//           <action android:name="android.intent.action.PACKAGE_ADDED" />
//           <action android:name="android.intent.action.PACKAGE_REPLACED" />
//           <data android:scheme="package" />
//       </intent-filter>
//   </receiver>
//
// REGISTER PLUGIN — in MainActivity.java/kt:
//   registerPlugin(SentinelInstallMonitor::class.java)
//
// CALL FROM JS:
//   import { registerPlugin } from '@capacitor/core';
//   const Sentinel = registerPlugin('SentinelInstallMonitor');
//   await Sentinel.startMonitoring();
//   Sentinel.addListener('packageInstalled', (event) => { ... });
//
// PLAY STORE NOTE: QUERY_ALL_PACKAGES requires justification. Submit your app
// under the "Device Security" use case or expect rejection.
// =============================================================================

package app.lovable.sentinel

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

private const val CHANNEL_ID = "sentinel_install_alerts"
private const val PLAY_STORE_PKG = "com.android.vending"
private val RISKY_KEYWORDS = listOf("mod", "crack", "hack", "premium apk", "cracked", "patched")

@CapacitorPlugin(name = "SentinelInstallMonitor")
class SentinelInstallMonitor : Plugin() {

    private var receiver: PackageInstallReceiver? = null

    override fun load() {
        createNotificationChannel(context)
        PackageInstallReceiver.pluginRef = this
    }

    @PluginMethod
    fun startMonitoring(call: PluginCall) {
        if (receiver == null) {
            receiver = PackageInstallReceiver()
            val filter = IntentFilter().apply {
                addAction(Intent.ACTION_PACKAGE_ADDED)
                addAction(Intent.ACTION_PACKAGE_REPLACED)
                addDataScheme("package")
            }
            context.registerReceiver(receiver, filter)
        }
        val ret = JSObject()
        ret.put("monitoring", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun stopMonitoring(call: PluginCall) {
        receiver?.let { context.unregisterReceiver(it) }
        receiver = null
        call.resolve()
    }

    /** Called by the BroadcastReceiver when a new package is installed. */
    fun emitPackageInstalled(data: JSObject) {
        notifyListeners("packageInstalled", data)
    }

    private fun createNotificationChannel(ctx: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Sentinel Install Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time alerts when new apps are installed"
            }
            val mgr = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            mgr.createNotificationChannel(channel)
        }
    }
}

class PackageInstallReceiver : BroadcastReceiver() {
    companion object {
        var pluginRef: SentinelInstallMonitor? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_PACKAGE_ADDED &&
            intent.action != Intent.ACTION_PACKAGE_REPLACED) return
        // Skip update broadcasts (already-installed apps)
        if (intent.getBooleanExtra(Intent.EXTRA_REPLACING, false)) return

        val packageName = intent.data?.encodedSchemeSpecificPart ?: return
        val pm = context.packageManager

        val appName = try {
            val appInfo = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) { packageName }

        val installer = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                pm.getInstallSourceInfo(packageName).installingPackageName
            } else {
                @Suppress("DEPRECATION")
                pm.getInstallerPackageName(packageName)
            }
        } catch (e: Exception) { null }

        val fromPlayStore = installer == PLAY_STORE_PKG
        val nameLower = appName.lowercase()
        val matchedKeyword = RISKY_KEYWORDS.firstOrNull { nameLower.contains(it) }

        val (result, riskScore, reason) = when {
            matchedKeyword != null -> Triple("unsafe", 90, "Risky keyword: '$matchedKeyword'")
            !fromPlayStore -> Triple("warning", 55, "Installed from unknown source")
            else -> Triple("safe", 10, "Verified Play Store install")
        }

        // Build payload for JS
        val payload = JSObject().apply {
            put("appName", appName)
            put("packageName", packageName)
            put("installSource", if (fromPlayStore) "playstore" else "unknown")
            put("result", result)
            put("riskScore", riskScore)
            put("reason", reason)
            put("timestamp", System.currentTimeMillis())
        }
        pluginRef?.emitPackageInstalled(payload)

        // Post system notification
        val (title, emoji) = when (result) {
            "safe" -> "App is safe to install" to "✅"
            "warning" -> "Warning: this app may be unsafe" to "⚠️"
            else -> "Unsafe APK detected" to "🚨"
        }
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pi = PendingIntent.getActivity(
            context, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val notif = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("$emoji $title")
            .setContentText("$appName ($reason)")
            .setStyle(NotificationCompat.BigTextStyle().bigText("$appName\n$reason\nSource: ${if (fromPlayStore) "Play Store" else "Unknown"}"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .build()
        val mgr = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        mgr.notify(packageName.hashCode(), notif)
    }
}
