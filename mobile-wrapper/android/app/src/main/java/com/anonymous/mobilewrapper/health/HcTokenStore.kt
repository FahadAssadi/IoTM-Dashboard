package com.anonymous.mobilewrapper.health

import android.content.Context
import java.util.concurrent.TimeUnit

object HcTokenStore {
  private const val PREFS = "hc_prefs"
  private const val KEY_TOKEN = "changes_token"
  private const val KEY_TOKEN_TS = "changes_token_ts"
  private const val KEY_LAST_SYNC = "last_sync_ts"

  // Baseline window & backfill progress
  private const val KEY_BASELINE_START = "baseline_start"   // ISO-8601 string
  private const val KEY_BASELINE_END = "baseline_end"       // ISO-8601 string
  private const val KEY_BASELINE_IN_PROGRESS = "baseline_in_progress"

  private const val KEY_BP_NEXT = "bp_next_page"
  private const val KEY_HR_NEXT = "hr_next_page"
  private const val KEY_SPO2_NEXT = "spo2_next_page"

  fun saveToken(context: Context, token: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit().putString(KEY_TOKEN, token)
      .putLong(KEY_TOKEN_TS, System.currentTimeMillis())
      .apply()
  }

  fun getToken(context: Context): String? =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_TOKEN, null)

  fun tokenTimestamp(context: Context): Long =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_TOKEN_TS, 0L)

  fun isTokenExpired(context: Context, maxAgeDays: Int = 30): Boolean {
    val ts = tokenTimestamp(context)
    if (ts == 0L) return true
    val ageMs = System.currentTimeMillis() - ts
    return ageMs > TimeUnit.DAYS.toMillis(maxAgeDays.toLong())
  }

  fun saveLastSyncNow(context: Context) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit().putLong(KEY_LAST_SYNC, System.currentTimeMillis()).apply()
  }

  fun getLastSync(context: Context): Long =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_LAST_SYNC, 0L)

  fun setBaselineRange(context: Context, startIso: String, endIso: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
      .putString(KEY_BASELINE_START, startIso)
      .putString(KEY_BASELINE_END, endIso)
      .apply()
  }
  fun getBaselineRange(context: Context): Pair<String?, String?> {
    val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    return sp.getString(KEY_BASELINE_START, null) to sp.getString(KEY_BASELINE_END, null)
  }

  fun setBaselineInProgress(context: Context, inProgress: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit().putBoolean(KEY_BASELINE_IN_PROGRESS, inProgress).apply()
  }
  fun isBaselineInProgress(context: Context): Boolean =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .getBoolean(KEY_BASELINE_IN_PROGRESS, false)

  fun setNextPage(context: Context, vital: String, token: String?) {
    val key = when (vital) {
      "bp" -> KEY_BP_NEXT
      "hr" -> KEY_HR_NEXT
      "spo2" -> KEY_SPO2_NEXT
      else -> return
    }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
      .putString(key, token).apply()
  }
  fun getNextPage(context: Context, vital: String): String? {
    val key = when (vital) {
      "bp" -> KEY_BP_NEXT
      "hr" -> KEY_HR_NEXT
      "spo2" -> KEY_SPO2_NEXT
      else -> return null
    }
    return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(key, null)
  }

  fun clear(context: Context) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply()
  }
}
