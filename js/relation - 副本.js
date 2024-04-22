// 定义节点和边
var nodes = new vis.DataSet([
	{id: 1, label: 'Alice', title: 'Founder and CEO. Alice is responsible for...', group: 1},
	{id: 2, label: 'Bob', title: 'Manager and Innovator. Bob has led numerous...', group: 2},
	{id: 3, label: 'Carol', title: 'Marketing Specialist. Carol specializes in...', group: 3}
]);

var edges = new vis.DataSet([
	{from: 1, to: 2, label: 'parent', font: {align: 'top'}},
	{from: 2, to: 3, label: 'parent', font: {align: 'top'}}
]);

// 创建网络图配置
var container = document.getElementById('network');
var data = {
	nodes: nodes,
	edges: edges
};
var options = {
	groups: {
		1: {color:{background:'#FFDDC1', border:'#FFDDC1'}},
		2: {color:{background:'#FABG88', border:'#FABG88'}},
		3: {color:{background:'#F78D6B', border:'#F78D6B'}}
	},
	interaction: {hover: true},
	physics: {
		stabilization: false,
		barnesHut: {
			gravitationalConstant: -30000
		}
	},
	layout: {
		hierarchical: {
			direction: 'UD',
			sortMethod: 'directed'
		}
	}
};

// 初始化网络图
var network = new vis.Network(container, data, options);