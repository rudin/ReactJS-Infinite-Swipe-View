import css from './App.css';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Motion, spring } from 'react-motion';

import TouchArea from 'TouchArea/TouchArea';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.GetPanes = ::this.GetPanes;
    this.handleTouchStart = ::this.handleTouchStart;
    this.handleTouchMove = ::this.handleTouchMove;
    this.handleTouchEnd = ::this.handleTouchEnd;
    this.setElementWidth = ::this.setElementWidth;
    this.state = {
      width: 1000,
      position: 0,
      memorizePosition: 0,
      touching: false,
      items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    };
  }

  setElementWidth() {
    const el = ReactDOM.findDOMNode(this);
    const width = el.offsetWidth;
    this.setState({width});
  }

  componentDidMount() {
    this.setElementWidth();
    window.addEventListener('resize', this.setElementWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setElementWidth);
  }

  handleTouchStart() {
    const memorizePosition = this.state.position;
    this.touchStartedAt = Date.now();
    this.setState({memorizePosition, touching: true});
  }

  handleTouchMove(offset) {
    const { width, memorizePosition, items } = this.state;
    const numItems = items.length-1;
    const offsetAsFactorOfOne = -1/width*offset;
    let newPosition = memorizePosition + offsetAsFactorOfOne;
    // at the beginning or at the end, follow finger at 1/2 speed
    if (newPosition < 0 || memorizePosition < 0) {
      let tooFar = newPosition;
      if (memorizePosition < 0) {
        newPosition = memorizePosition/2+tooFar/2;
      } else {
        newPosition = tooFar/2;
      }
    }
    if (newPosition > numItems || memorizePosition > numItems) {
      let tooFar = newPosition-numItems;
      if (memorizePosition > numItems) {
        newPosition = (memorizePosition-numItems)/2+numItems+tooFar/2;
      } else {
        newPosition = numItems+tooFar/2;
      }
    }
    this.setState({
      position: newPosition
    });
  }

  handleTouchEnd() {
    // what was the intent? did I swipe in a certain direction within a certain time frame.. if so, that's the intent
    // console.log(Date.now() - this.touchStartedAt);
    const { position, memorizePosition, items } = this.state;
    const flickTime = Date.now() - this.touchStartedAt;
    let newPosition = Math.round(position);
    if (flickTime < 300) {
      newPosition = position>memorizePosition? Math.round(memorizePosition+1) : Math.round(memorizePosition-1);
    }
    if (newPosition<0) {
      newPosition = 0;
    } else if (newPosition>items.length-1) {
      newPosition = items.length-1;
    }
    this.setState({touching: false, position: newPosition});
  }

  GetPanes(position) {
    const { items } = this.state;

    let firstItemToRender = Math.floor(position);

    let itemsToRender = items.filter((item, i) => (i == firstItemToRender || i == firstItemToRender+1));

    if (position < 0) {
      firstItemToRender = 0;
    }

    return itemsToRender.map((item, i) => {
      const text = `item: ${item}, position: ${Math.round(position*10)/10}, firstItemToRender: ${firstItemToRender}, i: ${i}`;
      return (
        <div className={css.pane} key={i+firstItemToRender} style={{WebkitTransform: 'translateX('+-100*((position-firstItemToRender)-i)+'%)'}}>{text}</div>
      );
    });

  }

  render() {

    const { position, touching, items } = this.state;

    const springConfig = touching? {stiffness:300, damping:30} : {stiffness:164, damping:23};

    return (

        <Motion defaultStyle={{x: 0}} style={{x: spring(position, springConfig)}}>

          { interpolated => 
            <div className={css.app}>
              { this.GetPanes(interpolated.x) }
              <TouchArea handleTouchStart={this.handleTouchStart} handleTouchMove={this.handleTouchMove} handleTouchEnd={this.handleTouchEnd} />
            </div> }

        </Motion>
    );
  }
};
