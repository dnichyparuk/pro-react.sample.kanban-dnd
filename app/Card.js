import React, {Component,PropTypes} from 'react';
import CheckList from './CheckList';
import marked from 'marked';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
/*---------dnd------------*/
import {DragSource, DropTarget} from 'react-dnd';
import constants from './constants';
/*-------------------------*/
let titlePropType = (props, propName, componentName) =>{
	if (props[propName]){
		let value = props[propName];
		if(typeof value!=='string' || value.length>80){
			return new Error('${propName} in ${componentName} is longer then 80 characters');
		}
	}
};
/*---------dnd------------*/
const cardDragSpecs={
	beginDrag(props){
		return{
			id: props.id,
			status: props.status
		};
	},
	endDrag(props){
		props.cardCallbacks.persistCardDrag(props.id,props.status);
	}
};

const cardDropSpec={
	hover(props,monitor){
		const draggedId=monitor.getItem().id;
		props.cardCallbacks.updateCardPosition(draggedId, props.id);
	}
};

let collectDrag = (connect,monitor)=>{
	return{
		connectDragSource:connect.dragSource()
	};
};

let collectDrop = (connect, monitor)=>{
	return {
		connectDropTarget:connect.dropTarget()
	};
};
/*------------------*/
class Card extends Component {
	constructor(){
			super(...arguments);
			this.state={
				showDetails:false
			};
		}
	toggleDetails(){
		this.setState({showDetails:!this.state.showDetails});
	}
	render(){	
		const {connectDragSource, connectDropTarget} = this.props; //-----dnd

		let cardDetails;
		if (this.state.showDetails){
			cardDetails = (
					<div className='card_details'>
						<span dangerouslySetInnerHTML={{__html:marked(this.props.description)}}/>
						<CheckList cardId={this.props.id} 
									taskCallbacks={this.props.taskCallbacks}
									tasks={this.props.tasks} />
					</div>
				);
		}

		let sideColor={
			position:'absolute',
			zIndex:-1,
			top:0,
			bottom:0,
			left:0,
			width:7,
			backgroundColor:this.props.color
		};

		return connectDropTarget(connectDragSource(			/*--dnd--s*/
				<div className='card'>
					<div style={sideColor}/>
					<div className={
							this.state.showDetails?"card_title card_title--is-open": "card_title"
						}
						  onClick={this.toggleDetails.bind(this)}>
						<span dangerouslySetInnerHTML={{__html:marked(this.props.title)}}/>
					</div>
					<ReactCSSTransitionGroup transitionName="toggle"
											transitionLeaveTimeout={250}
											transitionEnterTimeout={150}>
					{cardDetails}
					</ReactCSSTransitionGroup>
				</div>
			));
	}
}

Card.propTypes = {
	id: PropTypes.number,
	title: titlePropType, //PropTypes.string,
	description: PropTypes.string,
	color: PropTypes.string,
	tasks:PropTypes.arrayOf(PropTypes.object),
	taskCallbacks: PropTypes.object,
	cardCallbacks: PropTypes.object,
	connectDragSource: PropTypes.func.isRequired,
	connectDropTarget: PropTypes.func.isRequired
};

const dragHighOrdeCard = DragSource(constants.CARD, cardDragSpecs, collectDrag)(Card);
const dragDropHighOrderCard = DropTarget(constants.CARD, cardDropSpec, collectDrop)(dragHighOrdeCard);

export default  dragDropHighOrderCard;//--dnd