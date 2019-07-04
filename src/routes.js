import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const AdminList = React.lazy(() => import('./components/administrators/administrator-list'));
const AddAdminItem = React.lazy(() => import('./components/administrators/add-administrator'));
const AdminItem = React.lazy(() => import('./components/administrators/administrator-item'));
const UserList = React.lazy(() => import('./components/users/user-list'));
const UserItem = React.lazy(() => import('./components/users/user-item'));
const CategoryList = React.lazy(() => import('./components/categories/category-list'));
const AddCategoryItem = React.lazy(() => import('./components/categories/add-category'));
const CategoryItem = React.lazy(() => import('./components/categories/category-item'));
const SupplierList = React.lazy(() => import('./components/suppliers/supplier-list'));
const AddSupplierItem = React.lazy(() => import('./components/suppliers/add-supplier'));
const SupplierItem = React.lazy(() => import('./components/suppliers/supplier-item'));
const ProductList = React.lazy(() => import('./components/products/product-list'));
const AddProductItem = React.lazy(() => import('./components/products/add-product'));
const EditProductItem = React.lazy(() => import('./components/products/edit-product'));
const AttributeList = React.lazy(() => import('./components/products/attributes/attribute-list'));
const AddAttribute = React.lazy(() => import('./components/products/attributes/add-attribute'));

const TempDashboard = () => {
	return <span>Dashboard</span>;
}

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
		component: TempDashboard
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
		component: CategoryList,
	},
	ADD_CATEGORY: {
		path: '/categories/add',
		exact: true,
		name: 'Add Category',
		component: AddCategoryItem,
	},
	CATEGORY_DETAILS: {
		path: '/categories/:cid',
		exact: true,
		name: 'Category Details',
		component: CategoryItem,
	},
	SUPPLIER_LIST: {
		path: '/suppliers',
		exact: true,
		name: 'Suppliers',
		component: SupplierList,
	},
	ADD_SUPPLIER: {
		path: '/suppliers/add',
		exact: true,
		name: 'Add Supplier',
		component: AddSupplierItem,
	},
	SUPPLIER_DETAILS: {
		path: '/suppliers/:sid',
		exact: true,
		name: 'Supplier Details',
		component: SupplierItem,
	},
	PRODUCT_LIST: {
		path: '/products',
		exact: true,
		name: 'Products',
		component: ProductList,
	},
	ATTRIBUTE_LIST: {
		path: '/products/attributes',
		exact: true,
		name: 'Attributes',
		component: AttributeList,
	},
	ADD_ATTRIBUTE: {
		path: '/products/attributes/add',
		exact: true,
		name: 'Add Attribute',
		component: AddAttribute,
	},
	ADD_PRODUCT: {
		path: '/products/add',
		exact: true,
		name: 'Add Product',
		component: AddProductItem,
	},
	EDIT_PRODUCT: {
		path: '/products/:pid/edit',
		exact: true,
		name: 'Edit Product',
		component: EditProductItem,
	},
};

export default routes;
