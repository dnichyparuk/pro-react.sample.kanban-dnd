import React, { Component } from 'react';
import {render} from 'react-dom'
import KanbanBoardContainer from './KanbanBoardContainer';

let cardsList =[
	{
		id:1,
		title:'Card One title',
		description: 'Card detailed description',
		status: 'todo',
		tasks:[
			{id:1, name:"Task One", done:true},
			{id:2, name:"Task Two", done:false},
			{id:3, name:"Task Three", done:false}
		],
		color:'#bd8d31'
	},
	{
		id:2,
		title:'Write some code',
		description: 'You have to **Write** some **code**',
		status: 'in-progress',
		tasks:[],
		color:'#3a7e28'
	},
	{
		id:3,
		title:'Card Three title with very long title. Longer then 80 characters! Much longer!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
		description: 'Card detailed description',
		status: 'done',
		tasks:[],
		color:'#cd8c31'
	}
];

render(<KanbanBoardContainer/>,document.getElementById('root'));
