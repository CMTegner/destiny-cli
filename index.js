const destiny = require('destiny-client')

const API_KEY = (() => { throw new Error('No API key provided') })()
const client = destiny(API_KEY)

// PR #1: Constants for membershipType, e.g. import destiny, { XBOX, PS } from 'destiny-client'

const XBL = 1
const PSN = 2
const TITAN = 0
const HUNTER = 1
const WARLOCK = 2

function search (name) {
  return client
    .Search({
      membershipType: PSN,
      name
    })
    .then(users => {
      if (users.length === 0) {
        throw new Error(`No users matching '${name}'`)
      } else {
        // TODO: Handle users.length > 1
        return users[0]
      }
    })
}

function getAccount (membershipId) {
  return client
    .Account({
      membershipType: PSN,
      membershipId
    })
}

function getInventory (membershipId, characterId) {
  return client
    .Inventory({
      membershipType: PSN,
      membershipId,
      characterId
    })
}

function getGrimoire (membershipId) {
  return client
    .Grimoire({
      membershipType: PSN,
      membershipId
    })
}

function getClassLabel (classType) {
  if (classType === TITAN) {
    return 'Titan'
  } else if (classType === HUNTER) {
    return 'Hunter'
  } else {
    return 'Warlock'
  }
}

let action = process.argv[2]
let name = process.argv[3]

if (action === 'characters') {
  search(name)
    .then(user => getAccount(user.membershipId))
    .then(({ characters }) => {
      let data = characters.map(({ characterBase }) => ({
        className: getClassLabel(characterBase.classType),
        light: characterBase.powerLevel,
        characterId: characterBase.characterId
      }))
      console.log(JSON.stringify(data, null, 2))
    })
    .catch(err => console.error(err))
} else if (action === 'inventory') {
  let characterId = process.argv[4]
  search(name)
    .then(user => getInventory(user.membershipId, characterId))
    .then(({ buckets }) => {
      console.log(JSON.stringify(buckets, null, 2))
    })
    .catch(err => console.error(err))
} else if (action === 'grimoire') {
  search(name)
    .then(user => getGrimoire(user.membershipId))
    .then(grimoire => {
      console.log(JSON.stringify(grimoire, null, 2))
    })
    .catch(err => console.error(err))
} else {
  console.error('Please provide an action as the first argument')
  process.exit(1)
}
