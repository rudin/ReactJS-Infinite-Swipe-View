import css from './TouchArea.css';

import React, { Component } from 'react';

export default class TouchArea extends Component {
  
  constructor(props) {
    super(props);
    this.handleTouchStart = ::this.handleTouchStart;
    this.handleTouchMove = ::this.handleTouchMove;
    this.handleTouchEnd = ::this.handleTouchEnd;
  }

  state = {
  	startPosition: 0,
  	currentPosition: 0,
  	offset: 0,
  	touching: false
  };
  
 	handleTouchStart(event) {
    // event.preventDefault();
    const startPosition = this.calculatePointerPosition(event);
    this.setState({startPosition, touching: true});
    this.props.handleTouchStart();
  }

  handleTouchMove(event) {
    event.preventDefault();
    if (typeof this.state.startPosition !== 'number') return;
    const el = React.findDOMNode(this);
    const currentPosition = this.calculatePointerPosition(event);
    const offset = currentPosition - this.state.startPosition;
    this.setState({
      currentPosition,
      offset
    });
    this.props.handleTouchMove(offset);
  }

  handleTouchEnd(event) {
    // event.preventDefault();
    this.setState({touching: false});
    this.props.handleTouchEnd();
  }

  calculatePointerPosition(event) {
    event = event.type.indexOf('touch') === 0 ? event.changedTouches[0] : event;
    const el = React.findDOMNode(this);
    const rect = el.getBoundingClientRect();
    const pos = event.clientX - rect.left;
    return pos;
  }

  componentDidMount() {
    const el = React.findDOMNode(this);
    el.addEventListener('touchstart', this.handleTouchStart, false);
    el.addEventListener('touchmove', this.handleTouchMove, false);
    el.addEventListener('touchend', this.handleTouchEnd, false);
  }

  componentWillUnmount() {
    const el = React.findDOMNode(this);
    el.removeEventListener('touchstart', this.handleTouchStart, false);
    el.removeEventListener('touchmove', this.handleTouchMove, false);
    el.removeEventListener('touchend', this.handleTouchEnd, false);
  }
  
  // <div className={styles.dot} style={{left:(this.state.currentPosition)+'px'}}></div>

  render() {
    return (
      <div className={css.area}></div>
    );
  }

};
