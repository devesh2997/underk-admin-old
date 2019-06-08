import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const AdminList = React.lazy(() => import('./components/administrators/administrator-list'));
const AddAdminItem = React.lazy(() => import('./components/administrators/add-administrator'));
const AdminItem = React.lazy(() => import('./components/administrators/administrator-item'));
const UserList = React.lazy(() => import('./components/users/user-list'));
const UserItem = React.lazy(() => import('./components/users/user-item'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = {
	HOME: {
		path: '/',
		exact: true,
		name: 'Home'
	},
	DASHBOARD: {
		path: '/dashboard',
		name: 'Dashboard',
		component: Dashboard
	},
	ADMINISTRATOR_LIST: {
		path: '/administrators',
		exact: true,
		name: 'Administrators',
		component: AdminList,
	},
	ADD_ADMINISTRATOR: {
		path: '/administrators/add',
		exact: true,
		name: 'Add Administrator',
		component: AddAdminItem,
	},
	ADMINISTRATOR_DETAILS: {
		path: '/administrators/:id',
		exact: true,
		name: 'Administrator Details',
		component: AdminItem,
	},
	USER_LIST: {
		path: '/users',
		exact: true,
		name: 'Users',
		component: UserList,
	},
	USER_DETAILS: {
		path: '/users/:id',
		exact: true,
		name: 'User Details',
		component: UserItem,
	},
	CATEGORY_LIST: {
		path: '/categories',
		exact: true,
		name: 'Categories',
		// component: CategoryList,
	},
	ADD_CATEGORY_ITEM: {
		path: '/categories/add',
		exact: true,
		name: 'Add Category item',
		// component: AddCategoryItem,
	},
	CATEGORY_ITEM: {
		path: '/categories/:cid',
		exact: true,
		name: 'Category item',
		// component: CategoryItem,
	},
	SUPPLIER_LIST: {
		path: '/suppliers',
		exact: true,
		name: 'Suppliers',
		// component: SupplierList,
	},
	ADD_SUPPLIER: {
		path: '/suppliers/add',
		exact: true,
		name: 'Add Supplier',
		// component: AddSupplierItem,
	},
	SUPPLIER_ITEM: {
		path: '/suppliers/:sid',
		exact: true,
		name: 'Category item',
		// component: SupplierItem,
	},
	PRODUCT_LIST: {
		path: '/products',
		exact: true,
		name: 'Products',
		// component: ProductList,
	},
	ADD_PRODUCT: {
		path: '/products/add',
		exact: true,
		name: 'Add Product',
		// component: AddProductItem,
	},
	EDIT_PRODUCT: {
		path: '/products/:pid/edit',
		exact: true,
		name: 'Edit Product',
		// component: EditProductItem,
	},
};

export default routes;
