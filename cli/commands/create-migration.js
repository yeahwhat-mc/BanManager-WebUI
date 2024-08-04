const { Args, Command } = require('@oclif/core')
const DBMigrate = require('db-migrate')

class CreateMigrationCommand extends Command {
  static args = {
    name: Args.string({
      description: 'Schema migration name',
      required: true
    })
  }

  async run () {
    const { args } = await this.parse(CreateMigrationCommand)
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

    await dbm.create(args.name)

    this.log('Database migration schema created')
  }
}

CreateMigrationCommand.description = 'Development only command to create a database schema changeset'

module.exports = CreateMigrationCommand
