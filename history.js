
(function($) {
	
	$.fn.mtree = function(action, options) {
		
		var config = $.extend({}, $.fn.mtree.defaults, options);
		
		if(action == 'setup') {
			return this.each(function() {
				var tree = $(this).get(0);
				ko.applyBindings(new MTreeModel(config), tree);
			});
		}
		
		if(action == 'selected') {
			return this.each(function() {
				var tree = $(this);
				var selected = $('.active', tree);
				var nodeOffset = selected.offset().top;
				var scrollTop = tree.scrollTop();
				
				if(nodeOffset != 0) {
					tree.animate({scrollTop: scrollTop + (nodeOffset - config.offset)});	
				}
			})
		}
		
		return this;
	}
	
	$.fn.mtree.defaults = {
		loader: function(node) {
			
		},
		nodes: [],
		onSelected : function(node) {
			
		},
		onToggle: function(node) {
			
		},
		offset: 16,
		icons: {
			buyer: 'glyphicon glyphicon-user',
			deptor: 'glyphicon glyphicon-th-list',
			subsciption: 'glyphicon glyphicon-cog',
			offer: 'glyphicon glyphicon-ok',
			suboffer: 'glyphicon glyphicon-play-circle',
			charge: 'glyphicon glyphicon-euro',
			node: 'glyphicon glyphicon-folder-open'
		}
	};
	
} (jQuery));

function MTreeModel(config) {
	
	var self = this;
	
	self.nodes = ko.observableArray([]);
	self.icons = config.icons;
	self.selected = null;
	self.loader = config.loader;
	self.onSelected = config.onSelected;
	self.onToggle = config.onToggle;
		
	$.each(config.nodes, function(index, value) {
		var node = new MTreeNode({
			level: 0,
			node: value,
			icons: self.icons,
			tree: self,
			parent: null,
			loader: config.loader
		});
		
		self.nodes.push(node);
	});
}

function MTreeNode(config) {
	
	var self = this;
	
	self.id = config.node.id;
	self.open = ko.observable(config.node.open);
	self.leaf = ko.observable(config.node.leaf);
	self.description = ko.observable(config.node.description);
	self.type = ko.observable(config.node.type);
	self.level = ko.observable(config.level);
	self.icon = ko.observable(config.icons[config.node.type]);
	self.children = ko.observableArray([]);
	self.selected = ko.observable(false);
	self.tree = config.tree;
	self.parent = config.parent;
	self.data = config.node.data;
	
	self.ready = false;
	self.loading = ko.observable(false);
	
	self.details = config.node.details;
	
	self.branchLoader = function() {
		self.tree.loader(self);
	};
	
	self.padding = ko.computed(function() {
		return (this.level() * 27 + 8) + 'px';
	}, self);
	
	self.addChildNodes = function(nodes) {
		
		$.each(nodes, function(index, value) {
			var node = new MTreeNode({
				level: self.level() + 1,
				node: value,
				icons: self.tree.icons,
				open: false,
				tree: self.tree,
				parent: self
			});
			
			self.children.push(node);
		});
		
		self.ready = true;
		self.loading(false);
		
		if(self.open() == false) {
			if(self.children().length > 0) {
				self.toggle();
			} else {
				self.leaf(true);
			}
		}
	}
	
	self.setChildNodes = function(nodes) {
		
		$.each(nodes, function(index, value) {
			var node = new MTreeNode({
				level: self.level() + 1,
				node: value,
				icons: self.tree.icons,
				open: value.open,
				tree: self.tree,
				parent: self
			});
			
			self.children.push(node);
		});
		
		self.ready = true;
		self.loading(false);
	}
	
	self.showDetails = ko.computed(function() {
		return this.details.length > 0;
	}, self);
	
	self.branch = function() {
		return self.loading() == false && self.leaf() == false;
	}
	
	self.showData = function() {
		return self.open() && self.data.length > 0;
	}
	
	self.toggle = function() {
		
		if(self.ready == false) {
			self.loading(true);
			self.branchLoader();
		} else if(self.loading() == false) {
			self.open(!self.open());
			self.tree.onToggle(self);
		}
	}
	
	self.select = function() {
		
		if(self.tree.selected != null) {
			var old = self.tree.selected;
			old.selected(false);
		}
		
		self.tree.selected = self;
		self.selected(true);
		
		self.tree.onSelected(self);
	}
	
	if(config.node.children.length > 0) {
		self.setChildNodes(config.node.children);
	}
	
	if(config.node.selected == true) {
		self.select();
	}
	
//	$.each(config.node.children, function(index, value) {
//		var node = new MTreeNode(value);
//		self.children.push(node);
//	});
}
