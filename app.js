const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//list of players in team
app.get("/players/", async (request, response) => {
  const getplayersQuery = `SELECT
      *
    FROM
    cricket_team`;

  const playersArray = await db.all(getplayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//creating a new player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addplayerQuery = `
    INSERT INTO
      cricket_team ( 
   player_name,
   jersey_number,
   role)
    VALUES
      (
         '${playerName}', 
          '${jerseyNumber}',  
          '${role}'
      );`;

  const dbResponse = await db.run(addplayerQuery);
  const playerID = dbResponse.lastID;
  response.send("Player Added to Team");
});

//get a player
app.get("/players/:playerID", async (request, response) => {
  const { playerID } = request.params;

  const getplayersQuery = `
  SELECT
      *
  FROM
      cricket_team
      where player_id=${playerID}`;

  const player = await db.get(getplayersQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//update player
app.put("/players/:playerID", async (request, response) => {
  const { playerID } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const getplayersQuery = `  
  UPDATE
      cricket_team
    SET
      player_name='${playerName}',
      jersey_number='${jerseyNumber}',
      role='${role}'
    WHERE
      player_id = ${playerID};`;

  const player = await db.run(getplayersQuery);
  response.send("Player Details Updated");
});

//delete a player
app.delete("/players/:playerID", async (request, response) => {
  const { playerID } = request.params;

  const getplayersQuery = `DELETE
    FROM
      cricket_team
      where player_id=${playerID}`;

  const player = await db.get(getplayersQuery);
  response.send("Player Removed");
});
