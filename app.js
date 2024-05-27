const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM 
    cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  const camel_case = playersArray => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    }
  }
  response.send(playersArray.map(eachPlayer => camel_case(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES (
    '${playerName}',
     ${jerseyNumber},
    '${role}' 
  );`

  const dbresponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT 
  * 
  FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  const playerArray = []
  playerArray.push(player)
  const camel_case = eachPlayer => {
    return {
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyNumber: eachPlayer.jersey_number,
      role: eachPlayer.role,
    }
  }
  const new_array = playerArray.map(eachPlayer => camel_case(eachPlayer))
  response.send(new_array[0])
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateQuery = `
  UPDATE cricket_team 
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = ${playerId};`

  await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deleteBookQuery)
  response.send('Player Removed')
})
module.exports = app
