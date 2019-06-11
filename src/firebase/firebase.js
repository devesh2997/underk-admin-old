//TODO  create a second Firebase project on the Firebase website to have one project for your development environment and one project for your production environment

import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const config = {
	apiKey: "AIzaSyBORS5EyMukyl6xO7MCaG1pJNAXw3J0EFc",
	authDomain: "underk-81232.firebaseapp.com",
	databaseURL: "https://underk-81232.firebaseio.com",
	projectId: "underk-81232",
	storageBucket: "underk-81232.appspot.com",
	messagingSenderId: "462799589288"
};

class Firebase {
	constructor() {
		app.initializeApp(config);

		/* Firebase APIs */

		this.auth = app.auth();
		this.db = app.firestore();
		this.storage = app.storage();

		this.googleProvider = new app.auth.GoogleAuthProvider();

		/* Helper */

		this.fieldValue = app.firestore.FieldValue;
		this.emailAuthProvider = app.auth.EmailAuthProvider;
	}



	// *** Auth API ***

	doCreateUserWithEmailAndPassword = (email, password) =>
		this.auth.createUserWithEmailAndPassword(email, password);

	doSignInWithEmailAndPassword = (email, password) =>
		this.auth.signInWithEmailAndPassword(email, password);

	doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

	doSignOut = () => this.auth.signOut();

	doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

	doPasswordUpdate = password =>
		this.auth.currentUser.updatePassword(password);

	doSendEmailVerification = () =>
		this.auth.currentUser.sendEmailVerification({ url: "http://localhost:3000", });

	// *** Merge Auth and DB User API *** //
	onAuthUserListener = (next, fallback) => this.auth.onAuthStateChanged(authUser => {
		if (authUser) {
			this.admin(authUser.uid).get().then(snapshot => {
				const dbUser = snapshot.data();
				// default empty roles
				if (!dbUser.roles) { dbUser.roles = {}; }
				// merge auth and db user
				authUser = {
					uid: authUser.uid,
					email: authUser.email,
					emailVerified: authUser.emailVerified,
					providerData: authUser.providerData,
					...dbUser, };
				next(authUser);
			});
		} else { fallback(); }
	});

	// *** Storage API ***
	productAssetsRef = () => this.storage.ref().child('assets_products');


	// *** User API ***
	user = uid => this.db.doc(`users/${uid}`);
	users = () => this.db.collection('users');
	admin = uid => this.db.doc(`admins/${uid}`);
	admins = () => this.db.collection('admins');

	// *** Category API ***
	category = category_id => this.db.doc(`categories/${category_id}`);
	categories = () => this.db.collection('categories');

	// *** Supplier API ***
	supplier = supplier_id => this.db.doc(`suppliers/${supplier_id}`);
	suppliers = () => this.db.collection('suppliers');

	// *** Product API ***
	product = product_id => this.db.doc(`products/${product_id}`);
	products = () => this.db.collection('products');

	// *** Attributes API ***
	clothingAttributes = () => this.db.collection('attributes').doc('clothing');

}

export default Firebase;
