
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { storeUser } from '../../actions';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  button: {
    marginLeft: theme.spacing(5)
  }
}));

const CreateGame = () => {

  const classes = useStyles();
  //States
  const [userName, setUserName] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const dispatch = useDispatch();
  const socket = useSelector((state) => state.socket);

  function codeGenerator() {
    const chars = "acdefhiklmnoqrstuvwxyz0123456789".split("");
    let result = "";
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(Math.random() * chars.length);
      result += chars[x];
    }
    return result;
  }

  async function getQuestions(cat, diff) {
    const categoryMap = {
      "General Knowledge": 9,
      "Entertainment: Books": 10,
      "Entertainment: Film": 11,
      "Entertainment: Music": 12,
      "Science: Computers": 18,
      Sports: 21,
    };
    const url = `https://opentdb.com/api.php?amount=10&category=${categoryMap[cat]}&difficulty=${diff}&type=multiple`;
    const { data } = await axios.get(url);
    return data.results;
  }

  //Username handling
  const handleUserName = (e) => setUserName(e.target.value);

  //Category handling
  const handleCategory = (e) => setCategory(e.target.value);

  //Difficulty handling
  const handleDifficulty = (e) => setDifficulty(e.target.value);

  //Form submission handling
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let roomName = codeGenerator();
    // axios request to get questions
    const questions = await getQuestions(category, difficulty);
    socket.emit("create game", {
      room: roomName,
      category,
      difficulty,
      host: userName,
      questions,
    });
    setGameCode(roomName);
    dispatch(storeUser(userName));
    setUserName("");
    setCategory("");
    setDifficulty("");
    setIsFormSubmitted(true);
  };

  return (
    <div className='create-form-container'>
    <form onSubmit={handleFormSubmit}>
      <div className='create-input'>
      <TextField label='Username' onChange={handleUserName} value={userName} className={classes.textField}/>
      </div>
      <div className='create-input'>
        <FormControl className={classes.formControl}>
          <InputLabel >Category</InputLabel>
          <Select value={category} onChange={handleCategory}>
            <MenuItem value="General Knowledge">General Knowledge</MenuItem>
            <MenuItem value="Entertainment: Books">Entertainment: Books</MenuItem>
            <MenuItem value="Entertainment: Film">Entertainment: Film</MenuItem>
            <MenuItem value="Entertainment: Music">Entertainment: Music</MenuItem>
            <MenuItem value="Sports">Sports</MenuItem>
            <MenuItem value="Science: Computers">Science: Computers</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className='create-input'>
        <FormControl className={classes.formControl}>
          <InputLabel >Difficulty</InputLabel>
          <Select value={difficulty} onChange={handleDifficulty}>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
      </div>
      
      <div className='create-input'>
      <Button className={classes.button} type="submit" variant="outlined" color="primary">Create Game</Button>
      </div>
    </form>
    {isFormSubmitted && <Redirect to='/waiting-room'/>}
    </div>
  );
};

export default CreateGame;
