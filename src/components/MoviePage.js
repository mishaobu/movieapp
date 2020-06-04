import React, { Component } from "react";
import MovieBlock from "./MovieBlock";

import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";

import axios from "axios";
import config from "../config";
import firebase from "firebase";

// API Key:
//http://www.omdbapi.com/?apikey=3f1dca30&i=tt3896198

export default class MoviePage extends Component {
  constructor() {
    super();
    this.state = {
      movies: [],
      lists: [],
      activeList: "All Movies",
      showLists: false,
      //listMovies: [],

      search: "",
      activeFilter: false,
      filteredMovies: [],

      movieid: "",
      time: null,
      movieRef: null,
      list: "",
      
      moreLoadable: false,
      totalLoaded: 8,
    };
    this.handleListSelect = this.handleListSelect.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNewList = this.handleNewList.bind(this);
    this.increaseLoad = this.increaseLoad.bind(this);
    this.goHome = this.goHome.bind(this);
  }


  goHome() {
    let ref = firebase.database().ref("movieid");
    ref.on("value", (snapshot) => {
      let newState = [];
      const data = snapshot.val();
      for (let item in data) {
        console.log(item);
        newState.push(data[item]);
      }
      this.setState({
        movies: newState,
        showLists: false,
        movieid: "",
        list: "",
        search: "",
        activeFilter: false,
      });
    });
  }

  increaseLoad() {
    let moreLoadable;
    if (this.state.totalLoaded + 8 < this.state.movies.length) {
      moreLoadable = true;
    } else {
      moreLoadable = false;
    }
    this.setState({
      //moreLoadable: moreLoadable,
      totalLoaded: this.state.totalLoaded + 8,
    })
  }

  handleValidation() {
    if (this.state.movieid === "") {
      alert("ID cannot be empty.");
    } else if (this.state.movieid.length != 9) {
      alert("ID should be 9 characters.");
    } else return true;
    return false;
  }

  handleNewList(e) {
    e.preventDefault();
    firebase
      .database()
      .ref("lists/" + this.state.list)
      .set("")
      .then(() => this.setState({ list: "" }));
    alert("New list submitted.");
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.handleValidation()) {
      axios
        .get("https://www.omdbapi.com/?apikey=fe15e914&i=" + this.state.movieid)
        .then((response) => {
          const movieRef = firebase
            .database()
            .ref("movieid/" + this.state.movieid);
          response.data["Lists"] = [""];
          console.log(response.data);
          setTimeout(() => movieRef.set(response.data));
        })
        .then(() => {
          let moreLoadable;
          if (this.state.movies.length > this.state.totalLoaded) {
            moreLoadable = true;
          } else {
            moreLoadable = false;
          }
          this.setState({
            movieid: "",
            time: null,
            moreLoadable: moreLoadable,
          });
        });
      alert("New movie submitted.");
    }
  }

  handleListSelect(e) {
    console.log("In handleListSelect", e.target)
    let listName = e.target.getAttribute("value")
    this.setState({
      activeList: listName,
    });
    let ref;
    if (listName !== "All Movies") {
      let ref = firebase.database().ref("lists/" + listName);
      let listMovies;
      ref.on("value", (snapshot) => {
        let newState = [];
        listMovies = newState;
        const data = snapshot.val();
        for (let item in data) {
          newState.push(data[item]);
        }
      });
      //console.log("NewState: ", listMovies);
      ref = firebase.database().ref("movieid");
      ref.on("value", (snapshot) => {
        let newState = [];
        const data = snapshot.val();
        for (let item in listMovies) {
          newState.push(data[listMovies[item]]);
        }
        this.setState({
          movies: newState,
        });
      });
    } else {
      this.setState({
        showLists: false,
      })
      ref = firebase.database().ref("movieid");
      ref.on("value", (snapshot) => {
        let newState = [];
        const data = snapshot.val();
        for (let item in data) {
          //console.log(item);
          newState.push(data[item]);
        }
        this.setState({
          movies: newState,
        });
      });
    }
  }

  handleSearchChange(e) {
    let activeFilter;
    this.setState({
      search: e.target.value
    });
    if (e.target.value !== "") {
      activeFilter = true;
    } else {
      activeFilter = false;
    }
    let filteredMovies = [];
    for (let i in this.state.movies) {
      if (this.state.movies[i].Title.toLowerCase().includes(e.target.value.toLowerCase())) {
        filteredMovies.push(this.state.movies[i]);
      }
    }

    // } 
    //   this.setState{[
    //     moreLoadable: true,
    //     totalLoaded: 100
    //   ]}
    // }
    this.setState({
      filteredMovies: filteredMovies,
      activeFilter: activeFilter,
    });
  }


  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    let ref = firebase.database().ref("movieid");
    ref.on("value", (snapshot) => {
      let newState = [];
      const data = snapshot.val();
      for (let item in data) {
        newState.push(data[item]);
        console.log(item);
      }

      let moreLoadable;
      if (this.state.totalLoaded < newState.length) {
        moreLoadable = true;
      } else {
        moreLoadable = false;
      }
      this.setState({
        movies: newState,
        moreLoadable: moreLoadable,
      });
    });
  // } else {
  //   let ref = firebase.database().ref("movieid");
  //   ref.on("value", (snapshot) => {
  //     let newState = [];
  //     const data = snapshot.val();
  //     for (let item in this.state.listMovies) {
  //       console.log(item);
  //       newState.push(data[item]);
  //     }
  //     this.setState({
  //       movies: newState,
  //     });
  //   });
  // }

    let ref2 = firebase.database().ref("lists");
    ref2.on("value", (snapshot) => {
      let newState = ["All Movies"];
      const data = snapshot.val();
      Object.keys(data).forEach(function (key) {
        newState.push(key);
      });
      this.setState({
        lists: newState
      });
    });
  }


  render() {
    const lists = this.state.lists;
    let moreLoadable = this.state.moreLoadable;
    console.log(this.state.moreLoadable, this.state.movies.length, this.state.totalLoaded)
    return (
      <div className="moviePage">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href = "#" onClick = {this.goHome}> Movie Manager</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <NavDropdown title="List" id="basic-nav-dropdown" onChange = {this.handleListSelect}>
                {this.state.lists.map((list, index) => (
                  <NavDropdown.Item onClick = {this.handleListSelect} value={list}> {list} </NavDropdown.Item>
                ))}
              </NavDropdown>
            </Nav>
            <Form inline className="listAddForm">
              <FormControl
                className="mr-1"
                type="text"
                name="list"
                onChange={this.handleChange}
                placeholder="List Name"
                value={this.state.list}
                onSubmit={this.handleNewList}
              />
              <Button className="mr-1" variant="outline-success" onClick = {this.handleNewList}>
                Add New List
              </Button>
            </Form>
            <Form inline className="movieAddForm">
              <FormControl
                className="mr-1"
                type="text"
                name="movieid"
                onChange={this.handleChange}
                placeholder="IMDB ID"
                value={this.state.movieid}
                onSubmit={this.handleSubmit}
              />
              <Button inline className="mr-5" variant="outline-success" onClick = {this.handleSubmit}>
                Add Movie
              </Button>
            </Form>
            <Form className="movieSearchForm">
              <FormControl
                type="text"
                name="search"
                onChange={this.handleSearchChange}
                placeholder="Search"
                value={this.state.search}
              />
            </Form>
          </Navbar.Collapse>
        </Navbar>

        <div className = "movieBlockDiv">
          {this.state.activeFilter
            ? this.state.filteredMovies.map((movieJSON, index) => (
                <MovieBlock key={index} json={movieJSON} lists={this.state.lists} />
              ))
            : this.state.movies.slice(0,this.state.totalLoaded).map((movieJSON, index) => (
                <MovieBlock key={index} json={movieJSON} lists={lists.slice(1,)} />
              ))
          }
        </div>

        {(this.state.moreLoadable && !(this.state.activeFilter) && !(this.state.movies.length <= this.state.totalLoaded)) ?
          <Button center className = "mt-4" variant = "outline-success" onClick = {this.increaseLoad}> Load More </Button> : <></>
        }
        <br/><br/>
      </div>
    );

  }
}
