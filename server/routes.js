const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');


const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();



// Route 1 (handler)
async function hello(req, res) {
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the FIFA server!`)
    } else {
        res.send(`Hello! Welcome to the FIFA server!`)
    }
}


// Route 2 (handler)
async function jersey(req, res) {
    const colors = ['red', 'blue']
    const jersey_number = Math.floor(Math.random() * 20) + 1
    const name = req.query.name ? req.query.name : "player"

    if (req.params.choice === 'number') {
        res.json({ message: `Hello, ${name}!`, jersey_number: jersey_number })
    } else if (req.params.choice === 'color') {
        var lucky_color_index = Math.floor(Math.random() * 2) ;
        res.json({ message: `Hello, ${name}!`, jersey_color: colors[lucky_color_index] })
    } else {
        res.json({ message: `Hello, ${name}, we like your jersey!` })
    }
}


// Route 3 (handler)
async function all_matches(req, res) {
    const league = req.params.league ? req.params.league : 'D1'
    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start=(page-1)*pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals  
        FROM Matches 
        WHERE Division = '${league}' 
        ORDER BY HomeTeam, AwayTeam
        LIMIT ${start},${pagesize}`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });


    } else {
        connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals  
        FROM Matches 
        WHERE Division = '${league}'
        ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}

// Route 4 (handler)
async function all_players(req, res) {
    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start=(page-1)*pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        connection.query(`SELECT PlayerID, Name, Nationality, OverallRating AS Rating, Potential, Club, Value  
        FROM Players  
        ORDER BY Name
        LIMIT ${start},${pagesize}`, function (error, results, fields) {

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });


    } else {
    
        connection.query(`SELECT PlayerID, Name, Nationality, OverallRating AS Rating, Potential, Club, Value  
        FROM Players 
        ORDER BY Name`, function (error, results, fields){

            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }

    
}


// ********************************************
//             MATCH-SPECIFIC ROUTES
// ********************************************

// Route 5 (handler)
async function match(req, res) {
    const id = req.query.id

    

    if (req.query.id && !isNaN(req.query.id)) {
        connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, 
        FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals,
        HalfTimeGoalsH AS HTHomeGoals, HalfTimeGoalsA AS HTAwayGoals, 
        ShotsH AS ShotsHome, ShotsA AS ShotsAway, 
        ShotsOnTargetH AS ShotsOnTargetHome, ShotsOnTargetA AS ShotsOnTargetAway, 
        FoulsH AS FoulsHome, FoulsA AS FoulsAway, 
        CornersH AS CornersHome, CornersA AS CornersAway, 
        YellowCardsH AS YCHome, YellowCardsA AS YCAway, 
        RedCardsH AS RCHome, RedCardsA AS RCAway
        FROM Matches  
        WHERE MatchId = '${id}'`, function (error, results, fields) {
            if (error) {
                var array=[]
                res.json({results: array})
            } else if (results) {
                res.json({ results: results })
            }

        });


    } else {
        var array=[]
        res.json({results: array})
    }
}

// ********************************************
//            PLAYER-SPECIFIC ROUTES
// ********************************************

// Route 6 (handler)
async function player(req, res) {
    const id = req.query.id

    if (req.query.id && !isNaN(req.query.id)) {
        connection.query(`SELECT PlayerId,  BestPosition
        FROM Players
        WHERE PlayerId = '${id}'`, function (error, results, fields){
            if (error) {
                var array=[]
                res.json({results: array})
            }else{
                if(results.length==0){
                    res.json({ results: results })
                }else{
                    var position=results[0].BestPosition
                    if(position=="GK"){
                            connection.query(`SELECT PlayerId, Name, Age, Photo, Nationality, Flag, OverallRating AS Rating, Potential, Club, ClubLogo, Value, Wage, InternationalReputation, Skill, JerseyNumber, ContractValidUntil, Height, Weight, BestPosition, BestOverallRating, ReleaseClause, GKPenalties, GKDiving, GKHandling, GKKicking, GKPositioning, GKReflexes
                            FROM Players
                            WHERE PlayerId = '${id}'`, function (error, results, fields){
                                if (error) {
                                    var array=[]
                                    res.json({results: array})
                                } else if (results) {
                                    res.json({ results: results })
                                }
                            });
                
                        }else{
                            connection.query(`SELECT PlayerId, Name, Age, Photo, Nationality, Flag, OverallRating AS Rating, Potential, Club, ClubLogo, Value, Wage, InternationalReputation, Skill, JerseyNumber, ContractValidUntil, Height, Weight, BestPosition, BestOverallRating, ReleaseClause, NPassing, NBallControl, NAdjustedAgility, NStamina, NStrength, NPositioning
                            FROM Players
                            WHERE PlayerId = '${id}'`, function (error, results, fields){
                                if (error) {
                                    var array=[]
                                    res.json({results: array})
                                } else if (results) {
                                    res.json({ results: results })
                                }
                            });
                
                        }
                    }

                
                }
        });

    } else {
        var array=[]
        res.json({results: array})
    }


   
}


// ********************************************
//             SEARCH ROUTES
// ********************************************

// Route 7 (handler)
async function search_matches(req, res) {
    const home=req.query.Home
    const away=req.query.Away 
    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start=(page-1)*pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        if(req.query.Home && req.query.Away){
            var home_conct='%'+home+'%'
            var away_conct='%'+away+'%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}' and AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }else if(req.query.Home && !req.query.Away){
            var home_conct='%'+home+'%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}'
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }else if(!req.query.Home && req.query.Away){
            var away_conct='%'+away+'%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }else{
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches
            ORDER BY HomeTeam, AwayTeam
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }


    } else {
        if(req.query.Home && req.query.Away){
            var home_conct='%'+home+'%'
            var away_conct='%'+away+'%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}' and AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }else if(req.query.Home && !req.query.Away){
            var home_conct='%'+home+'%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE HomeTeam LIKE '${home_conct}'
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }else if(!req.query.Home && req.query.Away){
            var away_conct='%'+away+'%'
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches  
            WHERE AwayTeam LIKE '${away_conct}'
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }else{
            connection.query(`SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals
            FROM Matches
            ORDER BY HomeTeam, AwayTeam`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
        }
    }


}

// Route 8 (handler)
async function search_players(req, res) {
    if(req.query.Name){
        var name='%'+req.query.Name+'%'
    }else{
        var name='%'
    }

    if(req.query.Nationality){
        var nationality='%'+req.query.Nationality+'%'
    }else{
        var nationality='%'
    }

    if(req.query.Club){
        var club='%'+req.query.Club+'%'
    }else{
        var club='%'
    }

    const ratingLow = req.query.RatingLow ? req.query.RatingLow : '0'
    const ratingHigh = req.query.RatingHigh ? req.query.RatingHigh : '100'

    const potentialLow = req.query.PotentialLow ? req.query.PotentialLow : '0'
    const potentialHigh = req.query.PotentialHigh ? req.query.PotentialHigh : '100'

    const page = req.query.page
    const pagesize = req.query.pagesize ? req.query.pagesize : '10'
    const start=(page-1)*pagesize

    if (req.query.page && !isNaN(req.query.page)) {
        connection.query(`SELECT PlayerId, Name, Nationality, OverallRating AS Rating, Potential, Club, Value
            FROM Players
            WHERE Name LIKE '${name}' and
            Nationality LIKE '${nationality}' and
            Club LIKE '${club}' and
            OverallRating >= ${ratingLow} and
            OverallRating <= ${ratingHigh} and
            Potential >= ${potentialLow} and
            Potential <= ${potentialHigh}
            ORDER BY Name
            LIMIT ${start},${pagesize}`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });


    } else {

        connection.query(`SELECT PlayerId, Name, Nationality, OverallRating AS Rating, Potential, Club, Value
            FROM Players
            WHERE Name LIKE '${name}' and
            Nationality LIKE '${nationality}' and
            Club LIKE '${club}' and
            OverallRating >= ${ratingLow} and
            OverallRating <= ${ratingHigh} and
            Potential >= ${potentialLow} and
            Potential <= ${potentialHigh}
            ORDER BY Name`, function (error, results, fields) {
                if (error) {
                    var array=[]
                    res.json({results: array})
                } else if (results) {
                    res.json({ results: results })
                }
            });
    
    }


    
}

module.exports = {
    hello,
    jersey,
    all_matches,
    all_players,
    match,
    player,
    search_matches,
    search_players
}