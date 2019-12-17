import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const OrdersList = React.lazy(() => import('./components/orders/orders-list'));
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
const ProductsHome = React.lazy(() => import('./components/products/products-home'));
const ProductList = React.lazy(() => import('./components/products/product-list'));
const AddProductItem = React.lazy(() => import('./components/products/add-product'));
const BulkUpload = React.lazy(()=>import('./components/products/bulk-upload/index'));
const EditProductItem = React.lazy(() => import('./components/products/edit-product'));
const AttributeList = React.lazy(() => import('./components/products/attributes/attribute-list'));
const AddAttribute = React.lazy(() => import('./components/products/attributes/add-attribute'));
const CollectionList = React.lazy(() => import('./components/products/collections/collection-list'));
const AddCollection = React.lazy(() => import('./components/products/collections/add-collection'));
const Strategies = React.lazy(()=>import('./components/strategies'));
const MobileHomeWidgetsManager = React.lazy(()=>import('./components/mobile-home-widgets'));
const ProductItem = React.lazy(()=>import('./components/products/product-item'));

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
	STRATEGIES: {
		path: '/strategies',
		name: 'Strategies',
		component: Strategies
	},
	HOME_WIDGETS: {
		path: '/landing-widgets',
		name: 'Home Widgets',
		component: MobileHomeWidgetsManager
	},
	ORDERS: {
		path: '/orders',
		exact: true,
		name: 'Orders',
		component: OrdersList
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
	PRODUCTS_HOME: {
		path: '/products',
		exact: true,
		name: 'Products',
		component: ProductsHome,
	},
	PRODUCT_LIST: {
		path: '/products/list',
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
		name: 'Add Collection',
		component: AddAttribute,
	},
	COLLECTION_LIST: {
		path: '/products/collections',
		exact: true,
		name: 'Collections',
		component: CollectionList,
	},
	ADD_COLLECTION: {
		path: '/products/collections/add',
		exact: true,
		name: 'Add Collection',
		component: AddCollection,
	},
	ADD_PRODUCT: {
		path: '/products/add',
		exact: true,
		name: 'Add Product',
		component: AddProductItem,
	},
	BULK_UPLOAD: {
		path: '/products/bulk',
		exact: true,
		name: 'Bulk Upload Products',
		component: BulkUpload,
	},
	PRODUCT_DETAILS: {
		path: '/products/:pid',
		exact: true,
		name: 'Product Details',
		component: ProductItem,
	},
	EDIT_PRODUCT: {
		path: '/products/:pid/edit',
		exact: true,
		name: 'Edit Product',
		component: EditProductItem,
	},
};

export default routes;
