document.addEventListener('DOMContentLoaded', function () {
    // Prepare the container for the network
    var container = document.getElementById('network');

	// 定义一个异步函数来加载数据，并返回nodes和edges
	async function loadGraphData(relationshipType) {
		let nodeFile = relationshipType === '族谱图' ? './data/node_family.json' : './data/node_intercourse.json';
        let edgeFile = relationshipType === '交际网' ? './data/edge_intercourse.json' : './data/edge_family.json';
		try {
			// 加载节点数据
			const nodeResponse = await fetch(nodeFile);
			const nodesData = await nodeResponse.json();

			// 加载边缘数据
			const edgeResponse = await fetch(edgeFile);
			const edgesData = await edgeResponse.json();

			// 返回一个包含nodes和edges数据的对象
			return { nodes: nodesData, edges: edgesData };
		} catch (error) {
			console.error('Failed to load the data: ', error);
			return { nodes: [], edges: [] }; // 发生错误时返回空数组
		}
	}
	// 监听单选按钮的变化，并加载对应的数据
    document.querySelectorAll('input[name="relationship"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
				console.log(this.value);
			}
        });
    });
	
	function loadGraph(relationshipType) {
		loadGraphData(relationshipType).then(data => {
			// 数据加载完毕后创建vis.DataSet
			var nodes = new vis.DataSet(data.nodes);
			var edges = new vis.DataSet(data.edges);
			// Provide the data in the vis format
			var data = {
				nodes: nodes,
				edges: edges
			};

			// Define options for the network
			var options = {
				interaction: { hover: true, dragNodes: true },
				nodes: {
					shape: 'dot',
					size: 30,
					fixed: {
						x: false,  // Allows horizontal movement
						y: false   // Allows vertical movement
					}
				},
				edges: {
					font: { align: 'top' },
					arrows: {
						to: { enabled: true, scaleFactor: 1.2 }
					},
					color: 'gray',
					smooth: true
				},
				layout: {
//					hierarchical: {
//						enabled: true,
//						levelSeparation: 300,
//						nodeSpacing: 300,
//						treeSpacing: 200,
//						direction: 'UD',  // from top (Up) to bottom (Down)
//						sortMethod: 'directed'  // ensures that edges direction is respected
//					}
				},
				physics: {
					enabled: false  // Disabling physics is important for a static tree layout
				}
			};
			
			if (relationshipType === '交际网') {
				options.layout = {
					// 禁用层次布局，启用自由布局
					hierarchical: false,
					randomSeed: undefined  // 可指定种子实现可重复的布局
				};
				options.physics = {
					// 使用物理引擎创建环形布局
					enabled: true,
					solver: 'repulsion',
					repulsion: {
						centralGravity: 0.0,
						springLength: 500,
						springConstant: 0.05,
						nodeDistance: 150,
						damping: 0.09
					},
					stabilization: { iterations: 150 }
				};
			} else {
				options.layout.hierarchical = {
					enabled: true,
					levelSeparation: 300,
					nodeSpacing: 300,
					treeSpacing: 200,
					direction: 'UD',
					sortMethod: 'directed'
				};
				options.physics = {
					enabled: false
				};
			}
			var stabilizationIterationsDone = false;
			// Initialize the network
			var network = new vis.Network(container, data, options);
			
			stabilizationIterationsDone = true;
			
			// 在网络稳定后禁用物理引擎以固定所有节点
			network.on("stabilizationIterationsDone", function () {
				network.setOptions({ physics: false });
			});
			
			if (stabilizationIterationsDone) {
				console.log("Stabilization done");
				network.setOptions({
					layout: {
						hierarchical: false
					},
					physics: {
						enabled: true,
						forceAtlas2Based: {
							gravitationalConstant: -50,
							centralGravity: 0.01,
							springLength: 100,
							springConstant: 0.08
						},
						maxVelocity: 50,
						solver: 'forceAtlas2Based',
						timestep: 0.35,
						stabilization: {iterations: 150}
					}
				});
			}

			// Add an event listener to open an alert box with node information on click
			network.on("click", function (params) {
				if (params.nodes.length > 0) {
					var nodeId = params.nodes[0];
					var nodeData = nodes.get(nodeId);
					alert(nodeData.title);
				}
			});
		});
	}
	
	// 绑定更新按钮的点击事件
	document.getElementById('update-range-btn').addEventListener('click', function() {
		// 获取选中的单选按钮的值
		var selectedRelationship = document.querySelector('input[name="relationship"]:checked').value;
		console.log(selectedRelationship);
		// 调用加载数据的函数，传递选中的关系类型
		loadGraph(selectedRelationship);
	});
	
    
});
