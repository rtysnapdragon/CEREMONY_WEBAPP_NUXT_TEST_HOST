import sqlite3 from "sqlite3"

const db = new sqlite3.Database(
  "C:/LN/NUXT/CEREMONY_WEBAPP_NUXT/.data/content/contents.sqlite"
)

db.all(
  "SELECT * FROM _content_content LIMIT 5",
  (err, rows) => {
    if (err) {
      console.error(err)
      return
    }

    console.log(JSON.stringify(rows, null, 2))
    db.close()
  }
)

// node view-db.js