/** SpagoBI, the Open Source Business Intelligence suite
 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

/**
 * 
 *  @author
 *  Marco Cortella (marco.cortella@eng.it)
 */

//TODO: DA SPOSTARE IN FILE SEPARATO
Ext.define('Item', {
    extend: 'Ext.data.Model',
    fields: ['text', 'canDropOnFirst', 'canDropOnSecond','']
})


Ext.define('Sbi.tools.hierarchieseditor.HierarchiesEditorSplittedPanel', {
    extend: 'Sbi.widgets.compositepannel.SplittedPanel'

    ,config: {
    	
    	
    }

	, constructor: function(config) {
		thisPanel = this;
		
		Ext.tip.QuickTipManager.init();

		
		this.initServices();
		
		//*******************
		//Automatic Hierarchies Combos
		this.hierarchiesStore;

		this.dimensionsStore = this.createDimensionsStore();
		
		this.comboDimensions = new Ext.form.ComboBox({
			id: 'dimensionsCombo',
			fieldLabel: LN('sbi.hierarchies.dimensions'),
			store :this.dimensionsStore,
			displayField : 'DIMENSION_NM',
			valueField :  'DIMENSION_NM',
			width : 300,
			typeAhead : true, forceSelection : true,
			mode : 'local',
			triggerAction : 'all',
			selectOnFocus : true, 
			editable : false,
			style:'padding:5px',
			listeners: {
				select:{
		               fn:function(combo, value) {
		            	   //populate hierarchies combo
		            	   this.comboHierarchies.setDisabled(false);
		            	   this.comboHierarchies.clearValue();
		            	   var dimensionName = value[0].get('DIMENSION_NM');
		            	   this.hierarchiesStore = this.createHierarchiesComboStore(dimensionName);
		            	   this.comboHierarchies.bindStore(this.hierarchiesStore);
		            	   //delete existing trees rendered
		            	   if ((Ext.getCmp('automaticTreePanel') != null) & (Ext.getCmp('automaticTreePanel') != undefined)){
			            	   this.leftPanel.remove(Ext.getCmp('automaticTreePanel'));
		            	   }
		            	   if ((Ext.getCmp('customTreePanel') != null) & (Ext.getCmp('customTreePanel') != undefined)){
			             	  	this.rightPanel.remove(Ext.getCmp('customTreePanel'));
		            	   }

		            	   //populate customHierarchies grid 
		            	   this.customHierarchiesGridStore = this.createCustomHierarchiesGridStore(dimensionName);
		            	   this.customHierarchiesGrid.reconfigure(this.customHierarchiesGridStore);
		            	   this.customHierarchiesGrid.setTitle("Custom Hierarchies for: "+dimensionName);
		               }
		           }
		        ,scope:this   
			}
		});
		
		this.comboHierarchies = new Ext.form.ComboBox({
			id: 'hierarchiesCombo',
			fieldLabel: LN('sbi.hierarchies.hierarchies'),
	        queryMode: 'local',
	        displayField : 'HIERARCHY_NM',
			valueField :  'HIERARCHY_NM',
			width : 300,
			typeAhead : true,
			triggerAction : 'all',
			editable : false,
			style:'padding:5px',
			disabled: true,
			listeners: {
				select:{
		               fn:function(combo, value) {
		            	  var hierarchy = value[0].get('HIERARCHY_NM');
		            	  var dimension = this.comboDimensions.getValue();
		            	  this.automaticHierarchiesTreeStore = this.createAutomaticHierarchyTreeStore(dimension, hierarchy);
		            	  this.leftPanel.remove(Ext.getCmp('automaticTreePanel'));
		            	  var myTreePanel = this.createTreePanel(this.automaticHierarchiesTreeStore);
		            	  this.leftPanel.add(myTreePanel);
		            	  myTreePanel.expandAll();

		               }
		           }
		        ,scope:this  
			}
		});
		
		
		this.automaticHierarchiesComboPanel =  Ext.create('Ext.panel.Panel', {
	        bodyStyle:'padding:20px',
	        height: 150,
			items:[this.comboDimensions,this.comboHierarchies]
		});
		
		//*******************
		//Custom Hierarchies Grid
		
		//empty store only for initialization
		this.customHierarchiesGridStore = new Ext.data.Store({
	        storeId: 'customHierarchiesStore',
	        fields: ['HIERARCHY_NM', 'HIERARCHY_TP']

	    });
		
		this.customHierarchiesGrid = new Ext.grid.Panel( {
	        title: 'Custom Hierarchies',
	        store: Ext.data.StoreManager.lookup('customHierarchiesStore'),
	        columns: [{
	            header: 'Name',
	            dataIndex: 'HIERARCHY_NM',
	            flex: 1
	        }, {
	            header: 'Type',
	            dataIndex: 'HIERARCHY_TP',
	            width: 100
	        }, {
				//SHOW TREE BUTTON
	        	menuDisabled: true,
				sortable: false,
				xtype: 'actioncolumn',
				width: 20,
				columnType: "decorated",
				items: [{
					tooltip: 'Show Hierarchy tree',
					iconCls   : 'button-detail',  
					handler: function(grid, rowIndex, colIndex) {
						var selectedRecord =  grid.store.getAt(rowIndex);
						thisPanel.onShowCustomHierarchyTree(selectedRecord);
					}
				}]
			}
	        , {
				//DELETE BUTTON
	        	menuDisabled: true,
				sortable: false,
				xtype: 'actioncolumn',
				width: 20,
				columnType: "decorated",
				items: [{
					tooltip: 'Delete custom Hierarchy',
					iconCls   : 'button-remove',  
					handler: function(grid, rowIndex, colIndex) {								
						var selectedRecord =  grid.store.getAt(rowIndex);
						alert("TODO: to implement");
						//thisPanel.onDeleteSchedulation(selectedRecord);
					}
				}]
			}
	        ],
	        height: 150,
	        width: '100%',
	    })
		
		
		//*******************
		//Trees
		
		/*
		this.store1 = new Ext.data.TreeStore({
	        model: 'Item',
	        root: {
	            text: 'Root 1',
	            expanded: true,
	            children: [{
	                text: 'Child 1',
	                id: 'Child 1',
	                canDropOnFirst: true,
	                canDropOnSecond: true,
	                leaf: true
	            }, {
	                text: 'Child 2',
	                id: 'Child 2',
	                canDropOnFirst: true,
	                canDropOnSecond: false,
	                leaf: true
	            }, {
	                text: 'Child 3',
	                id: 'Child 3',	                
	                canDropOnFirst: false,
	                canDropOnSecond: true,
	                leaf: true
	            }, {
	                text: 'Child 4',
	                id: 'Child 4',	                	                
	                canDropOnFirst: false,
	                canDropOnSecond: false,
	                leaf: true
	            },
	            {
	                text: 'Folder 5',
	                id: 'Folder 5',	                
	                canDropOnFirst: false,
	                canDropOnSecond: false,
	                children: [{
		                text: 'Child 51',
		                id: 'Child 51',		                
		                leaf: true
		            }, {
		                text: 'Child 52',
		                id: 'Child 52',
		                leaf: true
		            }]
	            }]
	        },
	        proxy: {
	            type: 'memory',
	            reader: {
	              type: 'json'
	            }
	          }
	    });
		*/
		
		this.automaticHierarchiesTreeStore;
		

	   this.store2 = new Ext.data.TreeStore({
	        model: 'Item',
	        root: {
	            text: 'Root 2',
	            expanded: true,
	            children: [{
	                text: 'Folder 1',
	                id: 'Folder 1',	                
	                children: [],
	                expanded: true
	            }, {
	                text: 'Folder 2',
	                id: 'Folder 2',	                
	                children: [],
	                expanded: true
	            }]
	        },
	        proxy: {
	            type: 'memory',
	            reader: {
	              type: 'json'
	            }
	          }
	   
	    });

	   this.treePanelRight = Ext.create('Ext.tree.Panel', {
	        id: 'customTreePanel',
	        layout: 'fit',
	        store: this.store2,
	        rootVisible: true,
	        frame: false,
	        border:false,
	        bodyStyle: {border:0},
            viewConfig: {
               plugins: {
                  ptype: 'treeviewdragdrop',
                  ddGroup: 'DDhierarchiesTrees',
                  enableDrag: true,
                  enableDrop: true
               }
              ,listeners: {
                nodedragover: function(targetNode, position, dragData){
                	alert("on drag over");
                    var rec = dragData.records[0],
                        isFirst = targetNode.isFirst(),
                        canDropFirst = rec.get('canDropOnFirst'),
                        canDropSecond = rec.get('canDropOnSecond');
                        
                    return isFirst ? canDropFirst : canDropSecond;
                }
	            , beforedrop: {
	                fn: this.onBeforeDropRightTree,
	                scope: this
	            }
            }	        
           }
	    });
		
		
		//**********************
		
		
		//Main Objects **************************************
		this.mainTitle = LN('sbi.hierarchies.editor');
		
		this.leftPanel =  Ext.create('Ext.panel.Panel', {
		    bodyPadding: 5,  
			title: LN('sbi.hierarchies.automatic'),
			items: [this.automaticHierarchiesComboPanel]
		});
		
		this.rightPanel =  Ext.create('Ext.panel.Panel', {
		    bodyPadding: 5,  	
			title: LN('sbi.hierarchies.custom'),
			items: [this.customHierarchiesGrid,this.treePanelRight]
		});
		//***************************************************
		
		this.callParent(arguments);

	}
	
	/******************************
	 * Initializations
	 *******************************/
	, createCustomHierarchiesGridStore: function(dimension){
		var baseParams = {}
		baseParams.dimension = dimension;
		
		
		this.services["getCustomHierarchies"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/getCustomHierarchies',
			baseParams: baseParams
		});
		
		var gridStore = new Ext.data.Store({
	        storeId: 'customHierarchiesStore',
	        fields: ['HIERARCHY_NM', 'HIERARCHY_TP'],
	        proxy: {
	            type: 'ajax',
	            url: this.services["getCustomHierarchies"],
	            reader: {
	                type: 'json'
	            }
	        }
	        
	    });
		
		gridStore.load();
		
		return gridStore;
	}
	
	, createDimensionsStore: function(){
		Ext.define("DimensionsModel", {
    		extend: 'Ext.data.Model',
            fields: ["DIMENSION_NM","DIMENSION_DS"]
    	});
    	
    	var dimensionsStore=  Ext.create('Ext.data.Store',{
    		model: "DimensionsModel",
    		proxy: {
    			type: 'ajax',
    			url:  this.services['getDimensions'],
    			reader: {
    				type:"json"
    			}
    		}
    	});
    	dimensionsStore.load();
    	
    	return dimensionsStore;
	}
	
	, createHierarchiesComboStore: function(dimension){
		Ext.define("HierarchiesModel", {
    		extend: 'Ext.data.Model',
            fields: ["HIERARCHY_NM"]
    	});
		
		var baseParams = {}
		baseParams.dimension = dimension;
		
		this.services["getHierarchiesOfDimension"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/hierarchiesOfDimension',
			baseParams: baseParams
		});
		
		var hierarchiesStore=  Ext.create('Ext.data.Store',{
    		model: "HierarchiesModel",
    		proxy: {
    			type: 'ajax',
    			url:  this.services['getHierarchiesOfDimension'],
    			reader: {
    				type:"json"
    			}
    		}
    	});
		hierarchiesStore.load();
    	
    	return hierarchiesStore;		
	}
	
	, createAutomaticHierarchyTreeStore: function(dimension, hierarchy){
		var baseParams = {}
		baseParams.dimension = dimension;
		baseParams.hierarchy = hierarchy;

		
		this.services["getAutomaticHierarchyTree"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/getAutomaticHierarchyTree',
			baseParams: baseParams
		});

		var automaticHierarchyTreeStore = new Ext.data.TreeStore({
			model:'Item',
			proxy: {
				type: 'ajax',
				url: this.services["getAutomaticHierarchyTree"],
				reader: {
					type: 'json'
				}
			}
			,autoload:true
			
		});
		return automaticHierarchyTreeStore;
		
	}	
	
	, createCustomHierarchyTreeStore: function(dimension, hierarchy){
		var baseParams = {}
		baseParams.dimension = dimension;
		baseParams.hierarchy = hierarchy;

		
		this.services["getCustomHierarchyTree"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/getCustomHierarchyTree',
			baseParams: baseParams
		});

		var customHierarchyTreeStore = new Ext.data.TreeStore({
			model:'Item',
			proxy: {
				type: 'ajax',
				url: this.services["getCustomHierarchyTree"],
				reader: {
					type: 'json'
				}
			}
			,autoload:true
			
		});
		return customHierarchyTreeStore;
		
	}	
	
	
	/***********************************
	 * REST services for Ajax calls
	 ***********************************/
	,initServices : function(baseParams) {
		this.services = [];
		
		if(baseParams == undefined){
			baseParams ={};
		}
		
		this.services["getDimensions"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/dimensions',
			baseParams: baseParams
		});
		
		this.services["getHierarchiesOfDimension"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/hierarchiesOfDimension',
			baseParams: baseParams //must specify a dimension parameter
		});
		
		this.services["getAutomaticHierarchyTree"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/getAutomaticHierarchyTree',
			baseParams: baseParams //must specify a dimension and hierarchy parameters
		});
		
		this.services["getCustomHierarchies"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/getCustomHierarchies',
			baseParams: baseParams //must specify a dimension parameter
		});
		
		this.services["getCustomHierarchyTree"]= Sbi.config.serviceRegistry.getRestServiceUrl({
			serviceName: 'hierarchies/getCustomHierarchyTree',
			baseParams: baseParams //must specify a dimension and hierarchy parameters
		});
		
		
	}	
	
	/**************************************
	 * Private methods
	 **************************************/
	 
	, onShowCustomHierarchyTree: function(selectedRecord){
		var hierarchyName = selectedRecord.get('HIERARCHY_NM');
		var dimensionName = this.comboDimensions.getValue();
		
		var customTreeStore = this.createCustomHierarchyTreeStore(dimensionName,hierarchyName)
  	  	this.rightPanel.remove(Ext.getCmp('customTreePanel'));
		var customTreePanel = this.createCustomTreePanel(customTreeStore);
		this.rightPanel.add(customTreePanel);
		customTreePanel.expandAll();
		
		
	}
	
	, createCustomTreePanel: function(store){
		return new Ext.tree.Panel({
	        id: 'customTreePanel',
	        layout: 'fit',
	        store: store,
	        rootVisible: false,
	        frame: false,
	        border:false,
	        bodyStyle: {border:0},
	        bodyStyle:'padding:20px',
	        viewConfig: {
	         plugins: {
	               ptype: 'treeviewdragdrop',
	               ddGroup: 'DDhierarchiesTrees',
	               enableDrag: true,
	               enableDrop: true
	            }
            ,listeners: {
            	
            	//TODO: listener per gestione drag drop
            	
            	/*
                nodedragover: function(targetNode, position, dragData){
                	alert("on drag over");
                    var rec = dragData.records[0],
                        isFirst = targetNode.isFirst(),
                        canDropFirst = rec.get('canDropOnFirst'),
                        canDropSecond = rec.get('canDropOnSecond');
                        
                    return isFirst ? canDropFirst : canDropSecond;
                }
	            , beforedrop: {
	                fn: this.onBeforeDropRightTree,
	                scope: this
	            }
	            */
            }	        
	        }
	    });
			
	}
	
	, createTreePanel: function(store){
		return new Ext.tree.Panel({
	        id: 'automaticTreePanel',
	        layout: 'fit',
	        store: store,
	        rootVisible: false,
	        frame: false,
	        border:false,
	        bodyStyle: {border:0},
	        bodyStyle:'padding:20px',
	        viewConfig: {
	            plugins: {
	               ptype: 'treeviewdragdrop',
	               ddGroup: 'DDhierarchiesTrees',
	               enableDrag: true,
	               enableDrop: false
	            }
	        }
	    });
			
	}
	
	, onBeforeDropRightTree: function(node, data, overModel, dropPosition, dropFunction, options) {
		//alert("before drop");
        //data.copy = true; //to copy node and not moving from source
        
        var isFirstTarget = overModel.data.isFirst;
        

        
        var nodeTargetName = node.textContent;
        
        var rec = data.records[0];
        var isLeaf = rec.get('leaf');
        var canDropFirst = rec.get('canDropOnFirst');
        var canDropSecond = rec.get('canDropOnSecond');
        
        var mystore = this.store2;
        /*
        if (isLeaf){
        	return false;
        }
        */
        /*
        if (isFirstTarget){
        	node = canDropFirst;
        } else {
        	alert ("Cannot drop this node here!");
        	return false;
        }
        */
        
        
        //test visita albero partendo dalla radice
        
        var rootNode =  mystore.getRootNode();
        /*
        var me = this;
        var hash = {};
        rootNode.cascadeBy(function(node) {
           // if (fn.call(me, node)) {
              if (node.data.parentId == 'root') {
                hash[node.data.id] = node.copy(null, true);
                hash[node.data.id].childNodes = [];
              }
              else if (hash[node.data.parentId]) {
                hash[node.data.parentId].appendChild(node.data);
              }
           // }
          });
        
        alert(hash);
        */
        var myJson= this.getJson(rootNode);
   }
	//Transform the Tree structure in a JSON form that can be converted to a string
	//node is the rootNode
	,getJson: function(node) {
		// Should deep copy so we don't affect the tree
		var json = node.data;

		json.children = [];
		for (var i=0; i < node.childNodes.length; i++) {
			json.children.push( this.getJson(node.childNodes[i]) );
		}
		return json;
	}


	



	
});
