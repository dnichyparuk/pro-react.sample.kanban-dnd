import React, {Component} from 'react';
import KanbanBoard from './KanbanBoard';
import update from 'react-addons-update';

import 'whatwg-fetch';
//import 'babel-ployfill';

import {throttle} from './utils';

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
	'Content-Type':'application/json',
	'Authorization':'abcd'
};


class KanbanBoardContainer extends Component {
	constructor(){
		super(...arguments);
		this.state={
			cards:[]
		};
		this.updateCardStatus = throttle(this.updateCardStatus.bind(this));
		this.updateCardPosition = throttle(this.updateCardPosition.bind(this));
	}
	render(){
		return (<KanbanBoard cards={this.state.cards}
							taskCallbacks={{
								toggle: this.toggleTask.bind(this),
								delete: this.deleteTask.bind(this),
								add: this.addTask.bind(this)
							}}
							cardCallbacks={{
								updateStatus:this.updateCardStatus.bind(this),
								updateCardPosition: this.updateCardPosition.bind(this),
								persistCardDrag:this.persistCardDrag.bind(this)
							}}
							/>);
	}
	componentDidMount(){
		fetch(API_URL+'/cards',{headers:API_HEADERS})
		.then((response)=>response.json())
		.then((responseData)=>{
			this.setState({cards:responseData});
		})
		.catch((error)=>{
			console.log('Error fetching and parsing data', error);
		});
	}
	addTask(cardId,taskName){
		let prevState = this.state;
		let cardIndex = this.state.cards.findIndex((card)=>card.id==cardId);
		let newTask = {id:Date.now(), name:taskName, done:false};
		let nextState = update(this.state.cards,{
			[cardIndex]:{
				tasks:{$push:[newTask]}
			}
		});

		this.setState({cards:nextState});
		fetch('${API_URL}/cards/${cardId}/tasks',{
			method:'post',
			headers:API_HEADERS,
			body: JSON.stringify(newTask)
		})
		.then((response)=>{
			if(response.ok){
				return response.json();
			}
			else{
				throw new Error('server error');
			}
		})
		.then((responseData)=>{
			newTask.id = responseData.id;
			this.setState({cards:nextState});
		})
		.catch((e)=>{
			console.error(e);
			this.setState(prevState)
		});
	}
	deleteTask(cardId, taskId, taskIndex){
		let prevState = this.state;
		let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
		let nextState = update(this.state.cards,{
			tasks:{$splice:[[taskIndex,1]]}
		});
		this.setState({cards:nextState});
		fetch('${API_URL}/cards/${cardId}/tasks/${taskId}',{
			method:'delete',
			headers:API_HEADERS
		})
		.then((response)=>{
			if(!response.ok){
				throw new Error('server error');
			}
		})
		.catch((e)=>{
			console.error(e);
			this.setState(prevState)
		});
	}
	toggleTask(cardId, taskId, taskIndex){
		let cardIndex = this.state.cards.findIndex((card)=>card.id==cardId);
		let newDoneValue;
		let nextState = update(this.state.cards,{
			[cardIndex]:{
				tasks:{
					[taskIndex]:{
						done:{
							$apply:(done)=>{
								newDoneValue = !done;
								return newDoneValue;
							}
						}
					}
				}
			}
		});
		this.setState({cards:nextState});
		fetch('${API_URL}/cards/${cardId}/tasks/${taskId}',{
			method:'put',
			headers: API_HEADERS,
			body:JSON.stringify({done:newDoneValue})
		})
		.then((response)=>{
			if(!response.ok){
				throw new Error('server error');
			}
		})
		.catch((e)=>{
			console.error(e);
			this.setState(prevState)
		});
	}
	updateCardStatus(cardId, listId){
		let cardIndex = this.state.cards.findIndex((card)=>card.id==cardId);
		let card = this.state.cards[cardIndex];
		if(card.status!==listId){
			this.setState(update(this.state,{
				cards:{
					[cardIndex]:{
						status:{$set:listId}
					}
				}
			}));
		}
	}
	updateCardPosition(cardId,afterId){
		if (cardId!==afterId){
			let cardIndex = this.state.cards.findIndex((card)=>card.id == cardId);
			let card = this.state.cards[cardIndex];
			let afterIndex = this.state.cards.findIndex((card)=>card.id==afterId);
			this.setState(update(this.state,{
				cards:{
					$splice:[
						[cardIndex,1],
						[afterIndex,0,card]
					]
				}
			}));
		}
	}
	persistCardDrag(cardId, status){
		let cardIndex = this.state.cards.findIndex((card)=>card.id==cardId);
		let card = this.state.cards[cardIndex];
		fetch(`${API_URL}/cards/${cardId}`,{
			method:'PUT',
			headers:API_HEADERS,
			body:JSON.stringify({status:card.status, row_order_position:cardIndex})
		})
		.then((response)=>{
			if(!response.ok){
				throw new Error('Server operation failed');
			}
		})
		.catch((error)=>{
			console.error('Fetch error:',erro);
			this.setState(update(
				this.state,
				{
					cards:{
						[cardIndex]:{
							status:{$set:status}
						}
					}
				}));
		});
	}
}



export default KanbanBoardContainer;