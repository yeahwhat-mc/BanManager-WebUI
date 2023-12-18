const { Command } = require('@oclif/core')
const DBMigrate = require('db-migrate')

class UpdateCommand extends Command {
  async run () {
    const dbConfig = {
      connectionLimit: 1,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
      driver: { require: '@confuser/db-migrate-mysql' }
    }

    const dbm = DBMigrate.getInstance(true, {
      config: { dev: dbConfig },
      cmdOptions: {
        'migrations-dir': './server/data/migrations'
      }
    })

    await dbm.up()

    this.log('Database updated successfully')
  }
}

UpdateCommand.description = 'Update database schema'

module.exports = UpdateCommand
