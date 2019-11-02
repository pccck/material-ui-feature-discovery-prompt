import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography';
import { withTheme } from '@material-ui/core/styles';
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import injectStyle from './injectStyle'

export class Circles extends Component {
  constructor (props) {
    super(props)
    injectStyle(`
    @keyframes innerPulse {
      0%      { transform: scale(1.0); }    
      100%    { transform: scale(1.1); }
    }`)

    injectStyle(`
    @keyframes outerPulse {
      0%      { transform: scale(1.0); opacity: 0.9 }    
      100%    { transform: scale(2.0); opacity: 0.0 }
    }`)
    this.state = {
      pos: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
        width: 1
      }
    }
    this.handleResize = () => {
      this.onResize(window.innerWidth)
    }
    this.handleClick = (e) => {
      if(!this.node || !this.node.contains(e.target)){
        this.props.onClose()
      }
    }
  }

  onResize () {
    const pos = this.getComponentPosition();
    const vw = (window.innerWidth * window.devicePixelRatio)
    const vh = (window.innerHeight * window.devicePixelRatio)
    this.setState({ pos, vw, vh})
  }

  getStyles () {
    const { theme, backgroundColor, open, innerColor = "white" } = this.props
    const {pos, vw, vh} = this.state
    const drawTextAboveCenter = ((vh / 2) / pos.top < 1.0)
    //const drawTextLeftOfCenter = ((vw / 2) / pos.left < 1.0)
    const circleSize = pos.width + 40
    const outerCircleSize = Math.min(window.innerWidth*2, 1200)
    const textBoxHeight = 100

    let textBoxTop = pos.height /2  + (circleSize / 2 + 20)
    if (drawTextAboveCenter) {
      textBoxTop = textBoxTop * -1 - textBoxHeight
    }

    // Calculate chord length near the narrowest part of the text box to approximate correct width
    const textBoxWidth = 2 * Math.sqrt(Math.pow(outerCircleSize/2, 2) - Math.pow(Math.abs(textBoxTop + 10), 2));

    // Set the text box to span the chord of the circle
    const textBoxLeft = pos.width /2 + -1 * (textBoxWidth / 2)

    // Add padding to prevent going out of the viewport
    const leftOverFlow = (pos.x + pos.width / 2) - (textBoxWidth / 2)
    const textBoxLeftPadding = 40 + (leftOverFlow < 0 ? leftOverFlow * -1 : 0)
    
    const rightOverFlow = (pos.x + pos.width / 2) + (textBoxWidth / 2) - vw
    const textBoxRightPadding = 40 + (rightOverFlow > 0 ? rightOverFlow : 0)
    
    return {
      root: {
        zIndex: 1000,
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
      },
      cloneContainer: {
        width: pos.width,
      },
      cloneWrapper: {
      },
      circles: {
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'inherit' : 'none',
      },
      pulseInnerCircle: {
        position: 'absolute',
        transformOrigin: 'center center',
        height: `${circleSize}px`,
        width: `${circleSize}px`,
        top: 0,
        bottom: 0,
        left: -20,
        right: 0,
        margin: 'auto',
        transform: open ? 'scale(1)' : 'scale(0)',
        borderRadius: '50%',
        backgroundColor: innerColor,
        animation: open ? 'innerPulse 872ms 1.2s cubic-bezier(0.4, 0, 0.2, 1) alternate infinite' : null,
        transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1)'
      },
      pulseOuterCircle: {
        position: 'absolute',
        transformOrigin: 'center center',
        height: `${circleSize}px`,
        width: `${circleSize}px`,
        top: 0,
        bottom: 0,
        left: -20,
        right: 0,
        margin: 'auto',
        borderRadius: '50%',
        backgroundColor: innerColor,
        opacity: 0,
        animation: open ? 'outerPulse 1744ms 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite' : null
      },
      outerCircle: {
        position: 'absolute',
        transformOrigin: 'center center',
        transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1), opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) ${open ? 'scale(1.0)' : 'scale(0.8)'}`,
        height: `${outerCircleSize}px`,
        width: `${outerCircleSize}px`,
        borderRadius: '50%',
        backgroundColor,
        opacity: open ? 0.98 : 0,
        boxShadow: theme.shadows[6]
      },
      textBox: {
        position: 'absolute',
        boxSizing: 'border-box',
        zIndex: 25000,
        width: textBoxWidth ? textBoxWidth : 0,
        height: textBoxHeight,
        paddingLeft: textBoxLeftPadding,
        paddingRight: textBoxRightPadding,
        top: 0,
        left: 0,
        transform: `translate(${textBoxLeft}px, ${textBoxTop}px)`,
        color: 'white',
      }
    }
  }

  close () {
    if (this.content != null) {
      this.setState({pos: this.content.getBoundingClientRect(), open: false})
    }
  }

  open () {
    if (this.content != null) {
      this.handleResize()
      this.setState({pos: this.content.getBoundingClientRect(), open: true})
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.open && !this.props.open) {
      this.open()
    } else if (!nextProps.open && this.props.open) {
      this.close()
    }
  }

  componentDidMount () {
    this.handleResize();
    if (this.props.open) { 
      this.open();
    }
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.handleResize)
    window.addEventListener('mousedown', this.handleClick, false)
    this.content = findDOMNode(this.props.element)
    this.setState({pos: this.content.getBoundingClientRect()})
    this.updateInterval = setInterval(() => {
      if (this.props.open) {
        this.handleResize()
      }
    }, 250)
  }

  getComponentPosition () {
    if (!!this.content) {
      const pos = this.content.getBoundingClientRect()
      return pos;
    } else {
      return {
        top: 0, left: 0, width: 0, right: 0, height: 0, height: 0, bottom: 0
      }
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.handleResize)
    window.removeEventListener('mousedown', this.handleClick, false)
    clearInterval(this.updateInterval)
    this.content = null
  }

  render () {
    const styles = this.getStyles()
    if (!this.state.pos || (this.state.pos.bottom === 0 && this.state.pos.top === 0 && this.state.pos.left === 0 && this.state.pos.right === 0)) {
      return null;
    }
    return (
      <div ref={node => this.node = node} style={styles.root}>
        <div style={styles.circles}>
          <div style={styles.outerCircle}>
          </div>
        </div>
        <div style={styles.textBox}>
          <Typography variant='h6' style={{color: 'white'}}>{this.props.title}</Typography><br/>
          <Typography variant='body1' style={{color: 'white'}}>{this.props.description}</Typography>
        </div>
        <div style={styles.pulseOuterCircle}/>
        <div style={styles.pulseInnerCircle}/>
        
        <div style={styles.cloneContainer}>
            { this.props.open && this.props.children }
        </div>
      </div>
    )
  }
}

Circles.propTypes = {
  /** Fired when the the prompt is visible and clicked. */
  onClose: PropTypes.func.isRequired,
  /** Override the inline-styles of the circles element. */
  style: PropTypes.object,
  /** Defines the title text **/
  title: PropTypes.string.isRequired,
  /** Defines the description text **/
  description: PropTypes.string.isRequired
}

export default withTheme(Circles);