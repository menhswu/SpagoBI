/** SpagoBI, the Open Source Business Intelligence suite
 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

/**
 * 
 * The super class of the rows and columns container
 *
 *     
 *  @author
 *  Alberto Ghedin (alberto.ghedin@eng.it)
 */


Ext.define('Sbi.olap.execution.table.OlapExecutionAxisMember', {
	extend: 'Sbi.olap.execution.table.OlapExecutionMember',

	config:{		
		/**
		 * @cfg {boolean} firstMember
		 * Is this member the first one
		 */
		firstMember: false,

		/**
		 * @cfg {boolean} lastMember
		 * Is this member the last one
		 */
		lastMember: false

	},

	/**
	 * @property {Ext.Panel} moveUpPanel
	 * ABSTRACT: panel to move up in the axis positions the member
	 */
	moveUpPanel: null,

	/**
	 * @property {Ext.Panel} moveUpDown
	 * ABSTRACT: panel to move down in the axis positions the member
	 */
	moveDownPanel: null,

	/**
	 * @property {Ext.Panel} memberPanel
	 * central panel with the name of the member
	 */
	memberPanel:null,
	
	subPanelLayout: null,

	constructor : function(config) {
		this.initConfig(config);
		if(Sbi.settings && Sbi.settings.olap && Sbi.settings.olap.execution && Sbi.settings.olap.execution.table && Sbi.settings.olap.execution.table.OlapExecutionAxisMember) {
			this.initConfig(Sbi.settings.olap.execution.OlapExecutionAxisMember);
		}

		this.callParent(arguments);
	},


	initComponent: function() {
		
		this.buildMemberPanel();
		this.moveUpPanel = Ext.create("Ext.Panel",this.buildUpPanelConf());
		this.moveDownPanel =Ext.create("Ext.Panel",this.buildDownPanelConf());

		var items = [];
		if(!this.firstMember){
			items.push( this.moveUpPanel);
		}

		items.push( this.memberPanel);

		if(!this.lastMember){
			items.push( this.moveDownPanel);
		}


		Ext.apply(this, {
			items: items,
			layout: this.subPanelLayout,
			frame: true,

			listeners: {
				el: {
					mouseover: {
						fn: function (event, html, eOpts) {
							this.showMovePanels();
						},
						scope: this
					},
					mouseout: {
						fn: function (event, html, eOpts) {
							this.hideMovePanels();
						},
						scope: this
					}
				}
			}
		}
		);
		this.callParent();
	},

	
	/**
	 * Builds the central panel with the name of the member
	 */
	buildMemberPanel: function(){
		this.memberPanel = Ext.create("Ext.Panel",{
			xtype: "panel",
			border: false,
			html: this.getMemberName(),
			style: "background-color: transparent !important",
			bodyStyle: "background-color: transparent !important"
		});
	},
	
	/**
	 * Builds the central panel with the name of the member
	 */
	buildUpPanelConf: function(){
		return {
			xtype: "panel",
			style: "background-color: transparent !important",
			bodyStyle: "background-color: transparent !important",
			border: false,
			html: "  ",
			hidden: true,
			listeners: {
				el: {
					click: {
						fn: function (event, html, eOpts) {
							this.fireEvent("moveUp",this);
						},
						scope: this
					}
				}
			}
		};
	},
	
	/**
	 * Builds the central panel with the name of the member
	 */
	buildDownPanelConf: function(){
		return {
			xtype: "panel",
			style: "background-color: transparent !important",
			bodyStyle: "background-color: transparent !important",
			border: false,
			html: "  ",
			hidden: true,
			listeners: {
				el: {
					click: {
						fn: function (event, html, eOpts) {
							this.fireEvent("moveDown",this);
						},
						scope: this
					}
				}
			}
		};
	},

	/**
	 * Show the panels to move up/down the member
	 */
	showMovePanels: function(){
		this.moveUpPanel.show();
		this.moveDownPanel.show();
	},

	/**
	 * Hide the panels to move up/down the member
	 */
	hideMovePanels: function(){
		this.moveUpPanel.hide();
		this.moveDownPanel.hide();
	}



});





