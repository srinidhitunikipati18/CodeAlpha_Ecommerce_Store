const session = require('express-session');
const { getDb } = require('./db');

/**
 * Lightweight SQLite-backed session store for express-session.
 * Persists user and guest cart sessions across server restarts.
 */
class SQLiteSessionStore extends session.Store {
  constructor(options = {}) {
    super(options);
    this.ttlMs = options.ttlMs || 1000 * 60 * 60 * 24 * 7; // 7 days
    this.db = getDb();

    // Clean up expired sessions periodically
    const cleanupIntervalMs = options.cleanupIntervalMs || 1000 * 60 * 15;
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, cleanupIntervalMs);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  cleanupExpired() {
    try {
      this.db.prepare('DELETE FROM sessions WHERE expired <= ?').run(Date.now());
    } catch (_) {
      // Ignore cleanup errors during shutdown
    }
  }

  get(sid, callback) {
    try {
      const row = this.db
        .prepare('SELECT sess, expired FROM sessions WHERE sid = ?')
        .get(sid);
      if (!row) {
        return callback(null, null);
      }
      if (row.expired <= Date.now()) {
        this.destroy(sid, () => callback(null, null));
        return;
      }
      const parsed = JSON.parse(row.sess);
      callback(null, parsed);
    } catch (err) {
      callback(err);
    }
  }

  set(sid, sess, callback) {
    try {
      const maxAge = sess && sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : this.ttlMs;
      const expired = Date.now() + maxAge;
      const serialized = JSON.stringify(sess);
      this.db
        .prepare(
          `INSERT INTO sessions (sid, sess, expired)
           VALUES (?, ?, ?)
           ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expired = excluded.expired`
        )
        .run(sid, serialized, expired);
      callback && callback(null);
    } catch (err) {
      callback && callback(err);
    }
  }

  destroy(sid, callback) {
    try {
      this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback && callback(null);
    } catch (err) {
      callback && callback(err);
    }
  }

  touch(sid, sess, callback) {
    try {
      const maxAge = sess && sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : this.ttlMs;
      const expired = Date.now() + maxAge;
      this.db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?').run(expired, sid);
      callback && callback(null);
    } catch (err) {
      callback && callback(err);
    }
  }
}

module.exports = SQLiteSessionStore;
