import ROUTES from './routes';

export default {
	items: [
		{
			name: 'Dashboard',
			url: ROUTES.DASHBOARD.path,
			icon: 'fa fa-tachometer',
		},
		{
			name: 'Orders',
			url: ROUTES.ORDERS.path,
			icon: 'fa fa-user-secret',
			children: [
				{
					name: 'Orders List',
					url: ROUTES.ORDERS.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Returns List',
					url: ROUTES.RETURNS.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Custom Orders',
					url: ROUTES.CUSTOM_ORDERS.path,
					icon: 'fa fa-list-alt',
				},
			],
		},
		{
			name: 'Inventory',
			url: ROUTES.INVENTORY.path,
			icon: 'fa fa-user-secret',
			children: [
				{
					name: 'Transactions',
					url: ROUTES.INVENTORY_TRANSACTIONS.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Export',
					url: ROUTES.EXPORT_INVENTORY.path,
					icon: 'fa fa-list-alt',
				},
			],
		},
		{
			name: 'Administrators',
			url: ROUTES.ADMINISTRATOR_LIST.path,
			icon: 'fa fa-user-secret',
			children: [
				{
					name: 'Administrator List',
					url: ROUTES.ADMINISTRATOR_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Add Administrator',
					url: ROUTES.ADD_ADMINISTRATOR.path,
					icon: 'fa fa-user-plus',
				},
			],
		},
		{
			name: 'Users',
			url: ROUTES.USER_LIST.path,
			icon: 'fa fa-users',
		},
		{
			name: 'Categories',
			url: ROUTES.CATEGORY_LIST.path,
			icon: 'fa fa-th-large',
			children: [
				{
					name: 'Category List',
					url: ROUTES.CATEGORY_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Bulk Upload',
					url: ROUTES.CATEGORIES_BULK_UPLOAD.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Add Category',
					url: ROUTES.ADD_CATEGORY.path,
					icon: 'fa fa-plus',
				},
			],
		},
		{
			name: 'Suppliers',
			url: ROUTES.SUPPLIER_LIST.path,
			icon: 'fa fa-truck',
			children: [
				{
					name: 'Supplier List',
					url: ROUTES.SUPPLIER_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Add Supplier',
					url: ROUTES.ADD_SUPPLIER.path,
					icon: 'fa fa-plus',
				},
			],
		},
		{
			name: 'Products',
			url: ROUTES.PRODUCT_LIST.path,
			icon: 'fa fa-cubes',
			children: [
				{
					name: 'Home',
					url: ROUTES.PRODUCTS_HOME.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Product List',
					url: ROUTES.PRODUCT_LIST.path,
					icon: 'fa fa-list-alt',
				},
				// {
				// 	name: 'Add Product',
				// 	url: ROUTES.ADD_PRODUCT.path,
				// 	icon: 'fa fa-plus',
				// },
				{
					name: 'Bulk Upload',
					url: ROUTES.BULK_UPLOAD.path,
					icon: 'fa fa-plus',
				},
				{
					name: 'Attribute List',
					url: ROUTES.ATTRIBUTE_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Bulk Upload Attributes',
					url: ROUTES.ATTRIBUTES_BULK_UPLOAD.path,
					icon: 'fa fa-list-alt',
				},
				// {
				// 	name: 'Add Attribute',
				// 	url: ROUTES.ADD_ATTRIBUTE.path,
				// 	icon: 'fa fa-plus',
				// },
				{
					name: 'Collection List',
					url: ROUTES.COLLECTION_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Bulk Upload Collections',
					url: ROUTES.COLLECTIONS_BULK_UPLOAD.path,
					icon: 'fa fa-list-alt',
				},
				// {
				// 	name: 'Add Collection',
				// 	url: ROUTES.ADD_COLLECTION.path,
				// 	icon: 'fa fa-plus',
				// },

			],
		},
		{
			name: 'Accounting',
			url: ROUTES.ACCOUNTING_PURCHASE_SALE_SHEET.path,
			icon: 'fa fa-cubes',
			children: [
				{
					name: 'Purchase-Sale Sheet',
					url: ROUTES.ACCOUNTING_PURCHASE_SALE_SHEET.path,
					icon: 'fa fa-list-alt',
				},

			],
		},
		{
			name: 'Miscellaneous',
			url: ROUTES.MISCELLANEOUS_MAILS.path,
			icon: 'fa fa-cubes',
			children: [
				{
					name: 'Emails',
					url: ROUTES.MISCELLANEOUS_MAILS.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'SMS',
					url: ROUTES.MISCELLANEOUS_SMS.path,
					icon: 'fa fa-list-alt',
				},

			],
		},
		{
			name: 'Blogs',
			url: ROUTES.BLOG_LIST.path,
			icon: 'fa fa-rss',
			children: [
				{
					name: 'Blog List',
					url: ROUTES.BLOG_LIST.path,
					icon: 'fa fa-list-alt',
				},
				{
					name: 'Add Blog',
					url: ROUTES.ADD_BLOG.path,
					icon: 'fa fa-plus',
				},

			],
		},
	],
};



// {
// 	title: true,			// title
// 	name: '',
// 	wrapper: {				// optional wrapper object
// 		element: '',		// required valid HTML5 element tag
// 		attributes: {}		// optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
// 	},
// 	class: ''				// optional class names space delimited list for title item ex: "text-center"
// },

// {
// 	name: '',				// nav-item with badge
// 	url: '',
// 	icon: '',				// flag-icon-css, font-awesome, simple-line-icons
// 	badge: {
// 		variant: '',		// colors - as mentioned in src/views/Theme/Colors/Colors.js
// 		text: '',
// 	},
// },

// {
// 	name: '',				// nav-item with children
// 	url: '',
// 	icon: '',
// 	children: [
// 		{
// 			name: '',
// 			url: '',
// 			icon: '',
// 		},
// 	],
// },

// {
// 	divider: true,			// divider
// },
