import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { unmountComponentAtNode } from 'react-dom'
import { withTheme } from '@material-ui/core/styles';
import Portal from '@material-ui/core/Portal';
import Circles from './Circles';

function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;  
}

/**
 * Material Design feature discovery prompt
 * @see [Feature discovery](https://material.io/archive/guidelines/growth-communications/feature-discovery.html)
 */
export class FeatureDiscoveryPrompt extends Component {
  constructor (props) {
    super(props);
    this.promptRef = React.createRef()
  }


  componentDidMount () {
    this.portal = document.createElement('div')
    document.body.appendChild(this.portal)
    this.portal.style.position = 'fixed'
    this.portal.style.zIndex = 1
    this.portal.style.top = 0
    this.portal.style.left = 0
  }


  componentWillUnmount () {
    unmountComponentAtNode(this.portal)
    this.portal = null
  }

  render () {
    const { theme, children, open, color, innerColor, description, title, onClose } = this.props;
    const child = React.Children.only(children);
    let ref;
    if (!!this.promptRef.current) {
      if (isElement(this.promptRef.current)) {
        ref = this.promptRef.current;
      } else {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          console.warn('material-ui-feature-discovery-prompt: the child of a FeatureDiscoveryPrompt needs to be a DOM element.')
        }
      }
    }
    const styles = {}
    if (open) {
      styles.opacity = 0
    }
    return (
      <div>
        {React.cloneElement(child, {ref: this.promptRef, style:styles})}
        {
          !!open && !!ref &&
          <Portal container={this.portal}>
          <Circles
            backgroundColor={theme.palette[color].main}
            innerColor={innerColor}
            description={description}
            element={ref}
            onClose={onClose}
            open={open}
            title={title}
          >     
          { 
            React.cloneElement(child, {
              onClick: e => {onClose();child.props.onClick(e)},
              style: {...child.props.style, position: 'relative', top:0 , left:0, right:0, bottom:0},
              id: child.props.id ? `cloneOf-${child.props.id}` : null,
              name: child.props.name ? `cloneOf-${child.props.name}` : null,
              key: child.props.key ? `cloneOf-${child.props.key}` : null,
            })
           }
          </Circles>
        </Portal>
        }
      </div>
    )
  }
}

FeatureDiscoveryPrompt.propTypes = {
  /** Defines if the prompt is visible. */
  open: PropTypes.bool.isRequired,
  /** Fired when the the prompt is visible and clicked. */
  onClose: PropTypes.func.isRequired,
  /** The node which will be featured. */
  children: PropTypes.node.isRequired,
  /** Override the inline-styles of the circles element. */
  style: PropTypes.object,
  /** Defines the title text **/
  title: PropTypes.string.isRequired,
  /** Defines the description text **/
  description: PropTypes.string.isRequired,
  /**  **/
  color: PropTypes.oneOf(['primary', 'secondary']),
  /**  **/
  innerColor: PropTypes.string
}

export default withTheme(FeatureDiscoveryPrompt);