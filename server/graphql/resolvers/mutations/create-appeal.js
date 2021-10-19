const ExposedError = require('../../../data/exposed-error')
const appeal = require('../queries/appeal')

module.exports = async function createAppeal (obj, { input: { serverId, punishmentId, type, reason } }, { state, session }, info) {
  if (!state.serversPool.has(serverId)) throw new ExposedError('Server does not exist')

  const exists = await state.dbPool('bm_web_appeals').where({ server_id: serverId, punishment_id: punishmentId, punishment_type: type }).first()

  if (exists) {
    throw new ExposedError('An appeal already exists for this punishment')
  }

  const server = state.serversPool.get(serverId)
  const canAny = state.acl.hasServerPermission(serverId, 'player.appeals', 'create.any')

  let data

  switch (type) {
    case 'PlayerBan':
      if (!canAny && !state.acl.hasServerPermission(serverId, 'player.appeals', 'create.ban')) {
        throw new ExposedError(
          'You do not have permission to perform this action, please contact your server administrator')
      }

      data = await server.pool(server.config.tables.playerBans).where({ id: punishmentId }).first()

      break
    case 'PlayerKick':
      if (!canAny && !state.acl.hasServerPermission(serverId, 'player.appeals', 'create.kick')) {
        throw new ExposedError(
          'You do not have permission to perform this action, please contact your server administrator')
      }

      data = await server.pool(server.config.tables.playerKicks).where({ id: punishmentId }).first()

      break
    case 'PlayerMute':
      if (!canAny && !state.acl.hasServerPermission(serverId, 'player.appeals', 'create.mute')) {
        throw new ExposedError(
          'You do not have permission to perform this action, please contact your server administrator')
      }

      data = await server.pool(server.config.tables.playerMutes).where({ id: punishmentId }).first()

      break
    case 'PlayerWarning':
      if (!canAny && !state.acl.hasServerPermission(serverId, 'player.appeals', 'create.warning')) {
        throw new ExposedError(
          'You do not have permission to perform this action, please contact your server administrator')
      }

      data = await server.pool(server.config.tables.playerWarnings).where({ id: punishmentId }).first()

      break
    default:
      throw new ExposedError(`Invalid ${type} as punishment type`)
  }

  if (!data) throw new ExposedError(`Could not find ${type} of id ${punishmentId}`)

  const [id] = await state.dbPool('bm_web_appeals').insert({
    server_id: serverId,
    punishment_id: punishmentId,
    punishment_type: type,
    actor_id: session.playerId,
    assignee_id: null,
    reason: reason,
    created: state.dbPool.raw('UNIX_TIMESTAMP()'),
    updated: state.dbPool.raw('UNIX_TIMESTAMP()'),
    state_id: 1
  }, ['id'])

  return appeal(obj, { id }, { state }, info)
}
