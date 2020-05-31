import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import config from "../config";
const firebase = require("firebase");


export default class MovieBlock extends Component {
    constructor(props) {
        super(props);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleListClick = this.handleListClick.bind(this);
        this.state = { 
          data: [],
          isOpen: false,
          lists: [],
          toolbarButtons: [<button onClick = {this.handleDeleteClick} type = "button" value = "delete" className = "deleteMovieButton"> Delete Movie </button>],
        };
      }

      componentDidUpdate(prevProps) {
        if (prevProps.lists !== this.props.lists) {
          let toolbarButtons = [<button onClick = {this.handleDeleteClick} type = "button" value = "delete" className = "deleteMovieButton"> Delete Movie </button>]
          for (let index in this.props.lists) {
            let item = this.props.lists[index];
              toolbarButtons.push([<button onClick = {this.handleListClick} type = "button" value = "list" list = {item} className = "deleteMovieButton"> Add to {item} </button>]);
          }
          this.setState({
            toolbarButtons: toolbarButtons
          });
        }
      }


      componentDidMount() {
        if (!firebase.apps.length) {
            firebase.initializeApp(config)
        }
        let toolbarButtons = [<button onClick = {this.handleDeleteClick} type = "button" value = "delete" className = "deleteMovieButton"> Delete Movie </button>]
        for (let index in this.props.lists) {
          let item = this.props.lists[index];
            toolbarButtons.push([<button onClick = {this.handleListClick} type = "button" value = "list" list = {item} className = "deleteMovieButton"> Add to {item} </button>]);
        }
        this.setState({
          toolbarButtons: toolbarButtons
        });
      }

      handleListClick(e) {
        let listAddedTo = e.target.getAttribute('list');
        firebase.database().ref("lists/" + listAddedTo + "/" + this.props.json.imdbID).set(this.props.json.imdbID);
        alert(this.props.json.Title + " has been added to " + listAddedTo);
      }

      handleDeleteClick() {
        let ref = firebase.database().ref("movieid");
        ref.child(this.props.json.imdbID).remove();
        alert(this.props.json.Title + " has been deleted.");
      }


    render() {
       const isOpen = this.state.isOpen;
        return (
            <div>
              <img className = "movieBlock" src = {this.props.json.Poster} onClick = {() => this.setState({isOpen: true})}></img>
            {isOpen && (
              <Lightbox mainSrc = {this.props.json.Poster} 
               imageTitle = {this.props.json.Title} 
               imageCaption = {"Directed by: " + this.props.json.Director + '   ' + "|  IMDB Rating: " + this.props.json.imdbRating} 
               onCloseRequest={() => this.setState({ isOpen: false })}
               toolbarButtons = {this.state.toolbarButtons}
              />
            )}
          </div>
        );
    }
}