const express = require("express");
const router = express.Router();
const debug = require("debug")("server:auth");
const User = require("../models/User");
const Game = require("../models/Game");
const Question = require("../models/Question");
const TYPES = require("../models/questions_types");

router.post("/newGame", (req, res, next) => {
  var x = [];
  var gameQuestionsId = [];
  const numQuestions = 2;
  const {name, userId} = req.body;

  const gameQuestions = TYPES.map(element => {
    return Question.find({ category: element }).limit(numQuestions)
  });

  Promise.all(gameQuestions).then(questions => {
    x = [].concat.apply([], questions)
    gameQuestionsId = x.map(e => {return e._id});
    
    gameQuestionsId.sort(function(a, b) {
      return 0.5 - Math.random();
    });
    var players = [];
    players.push(userId);
    const theGame = new Game({
      questions: gameQuestionsId,
      name: name,
      creator: userId,
      players: players
    });
    return theGame.save().then(game => {
      Game.findById(game._id)
          .populate('creator')
          .populate('players')
          .populate('questions')
          .then ( game => {
            res.status(200).json(game);
          })      
    });
  })
  .catch(e => console.log(e));
});

router.post('/:id', (req,res, next) => {
  const {user,userScore} = req.body;
  const newRanking = {user: user, score: userScore};
  console.log('req.params.id')
  console.log(req.params.id)
  console.log('req.user._id');
  console.log(req.user._id);
  console.log(newRanking);

  Game.findById(req.params.id)
    .exec((err, game) => {
      if (err) { return res.status(500).json(err); }
      if (!game) { return res.status(404).json(err); }
      console.log(game);

      game.ranking.push(newRanking);
      console.log('game.ranking')
      console.log(game.ranking);
      console.log(game.ranking.user);
      game.status = 'finished';

      game.save( (err) => {
        if (err) { return res.status(500).json(err); }
        if (game.errors){ return res.status(400).json(game); }

        return res.status(200).json(game);
      });
  });
})












// router.post("/quizSuperhero", function(req, res, next) {
//   const option1 = req.body.Question1;
//   const option2 = req.body.Question2;
//   const option3 = req.body.Question3;
//   const heroe = req.body.heroe;
//   let id = req.user._id;
//   if (
//     option1 == req.body.solution[0] &&
//     option2 == req.body.solution[1] &&
//     option3 == req.body.solution[2]
//   ) {
//     let id = req.user._id;
//     User.find({ _id: id })
//       .then(us => {
//         var certUser = us[0].certifications;
//         certUser.push(heroe);
//         return certUser;
//       })
//       .then(cert => {
//         const update = {
//           certifications: cert
//         };
//         User.findByIdAndUpdate(id, update, { new: true }, (err, usr) => {
//           if (err) {
//             return next(err);
//           }
//         });
//       })
//       .catch(e => next(e));
//     req.flash("info", "Congratulations! You got a new Certification!");
//     res.redirect(`/onlyme?id=${id}`);
//     return;
//   } else {
//     req.flash("info", "You didn't pass the quiz. Try again.");
//     res.redirect(`/quiz/${heroe}`);
//   }
// });

module.exports = router;
