/** Form Handler for @Markojs
 * 
 * @version 1.0.0
 * @author Fabrice Marlboro
 * @date 15/04/2021
 * @repository https://github.com/fabrice8/markojs-form
 * 
 * @params options (Object)
 * 		- key: <string> Scope identifier key of the form Element in the component
 * 		- autosave: <true|false> Put the form on auto-save mode while the user is filling it.
 * 		- crosscheck: <true|false> Re-test the validation patterns of each inputs in the form before submission
 * 
 * @Dependencies
 * 		- UIStore Plugin for the auto-save feature. Check https://github.com/fabrice8/ui-store
 */
 "use strict";

 Object.defineProperty(exports, "__esModule", {
   value: true
 });
 exports.default = void 0;
 
 var _uiStore = _interopRequireDefault(require("@fabrice8/ui-store"));
 
 function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj };
 }
 
 function Patterns() {
   function extraSet(str) {
	 let combines = str.split(/\s*:\s*/);
	 return combines.length == 2 ? combines : [str, false];
   }
 
   function Testor(value, pattern, def) {
	 // Pattern validator not found
	 return (
	   !!(
		 PredefineList.hasOwnProperty(pattern) ||
		 CustomList.hasOwnProperty(pattern)
	   ) &&
	   ((PredefineList.hasOwnProperty(pattern) &&
		 PredefineList[pattern](value, def)) || // Pre-defiined pattern test
		 (CustomList.hasOwnProperty(pattern) &&
		   new RegExp(CustomList[pattern]).test(value)))
	 ); // Custom patterns test
   }
 
   const self = this,
	 PredefineList = {
	   required: (value) => /[a-zA-Z0-9]/.test(value),
	   domain: (value) => /^((http(s?)|ftp):\/\/)?[\w-]+(\.[\w-]+)/i.test(value),
	   url: (value) =>
		 /^((http(s?)|ftp):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/i.test(
		   value
		 ),
	   email: (value) =>
		 /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/i.test(
		   value
		 ),
	   phone: (value) => self.number && /\d{7,}|(\d{2,} ) => {3,}/.test(value),
	   fullname: (value) => /\s+/.test(value),
	   password: (value, type) => {
		 // validate a string words
		 let status,
		   TYPES = {
			 weak: 1,
			 medium: 2,
			 strong: 3,
			 perfect: 4
		   },
		   stars = 0; // Determine the level of password
 
		 return (
		   /(?=.*[a-z].*[a-z].*[a-z])/.test(value) && stars++,
		   /(?=.*[!@#$&*])/.test(value) && stars++,
		   /(?=.*[A-Z].*[A-Z])/.test(value) && stars++,
		   /(?=.*[0-9].*[0-9])/.test(value) && stars++,
		   /.{12,20}/.test(value)
			 ? (stars += 2)
			 : /.{8,12}/.test(value) && stars++,
		   stars >= 0 && stars < 2
			 ? (status = {
				 type: "weak",
				 indice: 1
			   })
			 : stars >= 2 && stars < 4
			 ? (status = {
				 type: "medium",
				 indice: 2
			   })
			 : stars >= 4 && stars < 6
			 ? (status = {
				 type: "strong",
				 indice: 3
			   })
			 : stars >= 6 &&
			   (status = {
				 type: "perfect",
				 indice: 4
			   }),
		   TYPES.hasOwnProperty(type) && TYPES[type] <= status.indice
		 );
	   },
	   number: (value) => typeof value == "number" || Number(value) !== null,
	   boolean: (value) => typeof value == "boolean",
	   array: (value) => Array.isArray(value),
	   object: (value) => typeof value == "object" && !Array.isArray(value),
	   lowercase: (value) => value.toLowerCase() == value,
	   uppercase: (value) => value.toUpperCase() == value,
	   length: (value, size) => value.length == parseInt(size),
	   minLength: (value, size) => value.length >= parseInt(size),
	   maxLength: (value, size) => value.length <= parseInt(size)
	 },
	 CustomList = {};
   (this.add = (name, regexp) => (CustomList[name] = regexp)),
	 (this.has = (pattern) =>
	   PredefineList.hasOwnProperty(pattern) ||
	   CustomList.hasOwnProperty(pattern)),
	 (this.test = (sequence, value) => {
	   // OR composed pattern
	   if (/\|/.test(sequence)) {
		 const results = sequence
		   .split(/\s*\|\s*/)
		   .map((each) => self.test(each, value));
		 return results.includes(true);
	   } // Single or AND pattern
 
	   if (/\s+/.test(sequence))
		 return self.multiTest(sequence.split(/\s+/g), value);
	   // pattern of multiple different type of value possible
	   else {
		 let [def] = extraSet(sequence);
		 return Testor(value, sequence, def);
	   }
	 }),
	 (this.multiTest = (sequenceList, value, extra) => {
	   // handle inputs that can have multiple different type of value possible
	   // Can have: Email or phone or date or ...
	   let state = false; // test if the value correspond to one of the type of the list
 
	   if (sequenceList.length)
		 for (let o = 0; o < sequenceList.length; o++) {
		   let [pattern, def] = extraSet(sequenceList[o]);
 
		   if (!Testor(value, pattern, def)) {
			 state = false;
			 break;
		   } else state = true;
		 }
	   return state;
	 });
 }
 
 function getAttributes(inputs, type) {
   const element = inputs.pop();
   let value, name, pattern; // Standard HTML Element
 
   return (
	 typeof element.getAttribute == "function"
	   ? ((value =
		   element.getAttribute("type") == "number"
			 ? parseInt(element.value)
			 : element.value),
		 (name = element.getAttribute("name")),
		 (pattern = element.getAttribute("validate")))
	   : ((value = inputs.pop() || element.input.value),
		 (name = element.input.name),
		 (pattern = element.input.validate)),
	 type === "checked" ? (value = element.checked) : void 0,
	 {
	   value,
	   name,
	   pattern
	 }
   );
 }
 
 function subSet(obj, link, data) {
   const nsp = link.split("."),
	 toCheck = nsp.shift();
   return (!obj.hasOwnProperty(toCheck) && nsp.length && (obj[toCheck] = {}),
   typeof obj == "object" && nsp.length)
	 ? ((obj = obj[toCheck]), subSet(obj, nsp.join("."), data))
	 : ((obj[toCheck] = data), true);
 }
 
 let store = "fh--auto-fill",
   PEvents = ["bind", "unbind", "input", "error", "fill", "autosave", "reset"];
 /* Initialize the UI Store plugin */
 
 const uiStore = new _uiStore.default({
   prefix: "fh-00",
   encrypt: true
 });
 
 function FormHandler(options) {
   function applyChange({ value, name, pattern }) {
	 const toSet = {}; // Edit the form state
 
	 // Apply changes
	 self.set(name, value),
	   (self.formError[name] = false),
	   pattern &&
		 !self.Patterns.test(pattern, value) &&
		 ((self.formError[name] = true), fireEvent("error", [name, value])),
	   self.component.setStateDirty("formError", self.formError);
   }
 
   function definePattern({ name, regexp }) {
	 if (!name || !regexp)
	   throw new Error("Invalid Pattern Defined. { <name>, <regexp> } expected"); // Remove regular expression closures "/"
 
	 regexp = String(regexp).replace(/^\/|\/$/g, "");
 
	 try {
	   new RegExp(regexp);
	 } catch (error) {
	   throw new Error("Invalid Regular Expression: ", error);
	 } // Add this to patterns bucket
 
	 return self.Patterns.add(name, regexp), name;
   }
 
   function autoSave() {
	 if (self.options.key && self.options.autosave) {
	   const allSaved = uiStore.get(store) || {};
	   (allSaved[self.options.key] = self.form),
		 uiStore.set(store, allSaved),
		 fireEvent("autosave", [self.form]);
	 }
   }
 
   function autoClear() {
	 !self.options.key || uiStore.update(store, self.options.key, "delete");
   }
 
   function fireEvent(name, args) {
	 !Events.hasOwnProperty(name) ||
	   Events[name].map((fn) => (Array.isArray(args) ? fn(...args) : fn()));
   }
 
   const self = this,
	 defaultOptions = {
	   autosave: false,
	   // Auto-save form while filling
	   crosscheck: true // Cross check validation pattern at submission
	 },
	 Events = {}; // Merge defined options with the default set.
 
   this.options = Object.assign({}, defaultOptions, options || {});
   // Auto-load saved data of this form
   let savedData;
 
   if (this.options.autosave) {
	 if (!this.options.key)
	   throw new Error(
		 "[FormHandler] Undefined Form Key Identifier. Required for Auto-Save"
	   );
	 uiStore && (savedData = (uiStore.get(store) || {})[this.options.key] || {});
   }
 
   /*------------------------------------------------------------------------*/
   // Bind this form to the container component
   // Unbind this form from the container component
 
   /*------------------------------------------------------------------------*/
   // Set a field to the form
   // Input data to fill the form
   // Set a field to the formError
   // Manually reset the form
   // Push thrown form alert message to state to be display
 
   /*------------------------------------------------------------------------*/
   // Define form & inputs validation patterns
   // Manual validation or pattern
 
   /*------------------------------------------------------------------------*/
   // Declare event listeners
   // Remove an event listeners
   // Remove all event listeners
   (this.form = {}),
	 (this.initForm = {}),
	 (this.formError = {}),
	 (this.formPatterns = {}),
	 (this.Patterns = new Patterns()),
	 (this.bind = (component, initForm) => {
	   // Prevent this form from doing the default browser submission
	   if (
		 ((this.component = component),
		 (this.initForm = initForm || {}),
		 (this.form = Object.assign({}, this.initForm, savedData)),
		 component.setState({
		   form: this.form,
		   formError: this.formError
		 }),
		 this.options.key)
	   ) {
		 let eForm;
		 component
		   .on("mount", () => {
			 (eForm = component.getEl(this.options.key)) &&
			   (eForm.onsubmit = (e) => e.preventDefault());
		   })
		   .on("update", () => {
			 /* In case the component mount without the form,
		 check at any update whether the form is rendered
		 in case it's being manipulated with MarkoJS
		 conditional component <if><else>
		 */
			 eForm ||
			   ((eForm = component.getEl(this.options.key)) &&
				 (eForm.onsubmit = (e) => e.preventDefault()));
		   });
	   } // Assignable listeners to form's inputs
 
	   return (
		 (component.__onInput = (...args) =>
		   applyChange(getAttributes(args, "input"))),
		 (component.__onChange = (...args) =>
		   applyChange(getAttributes(args, "change"))),
		 (component.__onSelect = (...args) =>
		   applyChange(getAttributes(args, "select"))),
		 (component.__onChecked = (...args) =>
		   applyChange(getAttributes(args, "checked"))),
		 fireEvent("bind"),
		 this
	   );
	 }),
	 (this.unbind = (component) => (
	   (component = component || this.component),
	   delete component.form,
	   delete component.formError,
	   delete component.__onInput,
	   delete component.__onChange,
	   delete component.__onSelect,
	   delete component.__onChecked,
	   fireEvent("unbind"),
	   this
	 )),
	 (this.set = (name, data) => (
	   /\./.test(name)
		 ? subSet(this.form, name, data) // Deep set
		 : (this.form[name] = data),
	   this.component.setStateDirty("form", this.form),
	   fireEvent("input", [name, data]),
	   this.options.autosave && uiStore && autoSave(),
	   this
	 )),
	 (this.fill = (data) => {
	   if (typeof data === "object")
		 return (
		   this.component.setStateDirty("form", Object.assign(this.form, data)),
		   fireEvent("fill", [this.form]),
		   this.options.autosave && uiStore && autoSave(),
		   this
		 );
	 }),
	 (this.error = (name, message) => (
	   (this.formError[name] = message),
	   this.component.setStateDirty("formError", this.formError),
	   fireEvent("error", [name, message]),
	   this
	 )),
	 (this.reset = () => (
	   (this.form = {}),
	   (this.formError = {}),
	   this.component.setState({
		 form: this.initForm,
		 formError: this.formError
	   }),
	   uiStore && autoClear(),
	   fireEvent("reset"),
	   this
	 )),
	 (this.alert = (message, type) => {
	   if (!message) return;
	   this.component.setStateDirty("alert", {
		 type: type || "info",
		 message
	   });
	   const autoDismiss = setTimeout(() => {
		 this.component.setState("alert", null), clearTimeout(autoDismiss);
	   }, 15000);
	   return this;
	 }),
	 (this.define = (arg) => {
	   // Defined existing validation pattern
	   if (typeof arg == "string")
		 return (
		   arg.split(/\s+|\|/).map((each) => {
			 const pattern = each.replace(/:(.+)$/, "");
			 if (!this.Patterns.has(pattern))
			   throw new Error(
				 "<" + each + "> is not a Predefined Validation Patterm"
			   );
		   }),
		   arg
		 );
	   /*----------------------------------------------------------------------*/
	   // Custom validate patterns
 
	   let nameSet = []; // Array of custom validate patterns: Eg. [{ name: 'custom1', regexp: '/\.+/' }, { name: 'custom2', regexp: '/\w+/' }]
 
	   // Return the concatenated name of defined patterns
	   return (
		 Array.isArray(arg)
		   ? arg.map((each) => nameSet.push(definePattern(each)))
		   : typeof arg == "object" && nameSet.push(definePattern(arg)),
		 nameSet.join(" ")
	   );
	 }),
	 (this.validate = (pattern, value) => this.Patterns.test(pattern, value)),
	 (this.on = (_event, fn) => {
	   // bounce unknow events
	   if (PEvents.includes(_event))
		 // additional listener
		 return (
		   Events.hasOwnProperty(_event) // first listener
			 ? Events[_event].push(fn)
			 : (Events[_event] = [fn]),
		   this
		 ); // Register the listener
	 }),
	 (this.off = (_event) => (delete Events[_event], this)),
	 (this.removeListeners = () => ((Events = {}), this));
 }
 
 var _default = FormHandler;
 exports.default = _default;
 