import css from './App.css';

import React, { Component } from 'react';
import { Spring } from 'react-motion';

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
    const el = React.findDOMNode(this);
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
    // percentage van de breedte van window!
    const { width, memorizePosition, items } = this.state;
    const numItems = items.length-1;
    const offsetAsFactorOfOne = -1/width*offset;
    let newPosition = memorizePosition + offsetAsFactorOfOne;
    // een deel van de offset moet voor 1/2 gerekend worden
    if (newPosition < 0 || memorizePosition < 0) {
      // nee zo snel gaat dat niet... welk deel van de offset moet ik halveren?!
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
    // bovenstaande gaat mis wanneer de memorizePosition < 0 is, maar na de tween komt dat feitelijk niet meer voor, dus, prima.
  }

  handleTouchEnd() {
    // check what was the intent!!! did I swipe in a certain direction within a certain time frame.. yes, that is important, within a timeframe
    console.log(Date.now() - this.touchStartedAt);
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
    // this.snapToClosest();
  }

  GetPanes() {
    const { position, items } = this.state;

    // er is toch een panes bron?! teksten? beelden? items? dus math floor en math ceil van de position, dat zijn de items die je renderen wil
    let firstItemToRender = Math.floor(position);

    let itemsToRender = items.filter((item, i) => (i == firstItemToRender || i == firstItemToRender+1));

    if (position < 0) {
      // hier moet e.e.a. ANDERS..
      // ten eerste een item ervoor plaatsen?! altijd 
      // itemsToRender.unshift(-1);
      // maar dat vind ik niet netjes?!
      firstItemToRender = 0;
      // beter!
    }

    return itemsToRender.map((item, i) => {
      // what happens when dragging to minus-something
      const text = `item: ${item}, position: ${Math.round(position*10)/10}, firstItemToRender: ${firstItemToRender}, i: ${i}`;

      // position bepaald first item to render
      return (
      <div className={css.pane} key={i+firstItemToRender} style={{WebkitTransform: 'translateX('+-100*((position-firstItemToRender)-i)+'%)'}}>{text}</div>
      );
    });

  }

  render() {
    // const Panes = this.GetPanes();
    const { position, touching, items } = this.state;
    // const itemsToRender = getItemsToRender();
    // in deze return een spring die drie scenarios kent:
    // - touch: met twee varianten <0 / >maxitems en DIRECT
    // - geen touch: vertraging, zodat ontouchend (wanneer er voor een SNAP gekozen wordt) de items soepel naar de juiste plek gaan
    const springConfig = [600, 50];
    let endValue;
    if (touching) {
      endValue = {y: {val: position, config: []}};
    } else {
      endValue = {y: {val: position, config: springConfig}}
    }

    /*
      <div className={css.app}>
        {Panes}
        <div>{position}</div>
        <TouchArea handleTouchStart={this.handleTouchStart} handleTouchMove={this.handleTouchMove} handleTouchEnd={this.handleTouchEnd} />
      </div>
    */

    return (
      
        <Spring endValue={endValue}>
          { interpolated => {
            
            let position = interpolated.y.val;

            let firstItemToRender = Math.floor(position);

            let itemsToRender = items.filter((item, i) => (i == firstItemToRender || i == firstItemToRender+1));
        
            if (position < 0) {
              // hier moet e.e.a. ANDERS..
              // ten eerste een item ervoor plaatsen?! altijd: met een gradient erin he?!
              // itemsToRender.unshift(-1);
              firstItemToRender = 0;
              // beter!
            }
        
            let RenderedItems =  itemsToRender.map((item, i) => {
              // what happens when dragging to minus-something
              const text = `item: ${item}, position: ${Math.round(position*10)/10}, firstItemToRender: ${firstItemToRender}, i: ${i}`;
              // position bepaald first item to render
              return (
              <div className={css.pane} key={i+firstItemToRender} style={{WebkitTransform: 'translateX('+-100*((position-firstItemToRender)-i)+'%)'}}>{text}</div>
              );
            });

            return (
              <div className={css.app}>
                {RenderedItems}
                <TouchArea handleTouchStart={this.handleTouchStart} handleTouchMove={this.handleTouchMove} handleTouchEnd={this.handleTouchEnd} />
              </div>);

          }}
        </Spring>
    );
  }
  // de 'panes' worden op de juiste plek gezet met translate en spring-value
};
