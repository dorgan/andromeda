/* ================================================================== *\
   (C) Copyright 2008 by Secure Data Software, Inc.
   This file is part of Andromeda
   
   Andromeda is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.

   Andromeda is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Andromeda; if not, write to the Free Software
   Foundation, Inc., 51 Franklin St, Fifth Floor,
   Boston, MA  02110-1301  USA 
   or visit http://www.gnu.org/licenses/gpl.html
\* ================================================================== */

/* ================================================================== *\
 
   Debugging using Firebug.
   
   This file is full of commands that make use of firebugs 
   very nice console facilities.  The up-side is that we get very
   thorough event tracing when needed.  The down-side is that they
   do not work at all on Internet Explorer and severely slow you 
   down while running.
   
   Therefore, it is desirable to be able to turn them off an on
   from time to time.  The best thing to do is comment them all
   out completely, but that can be tedious.  The following two
   Beanshell files show the jEdit commands for turning logging
   on and off by commenting and uncommenting the relevant lines.
   
   # Beanshell: Turn logging off by commenting out lines
   # NOTICE: THE FIRST AND SECOND LINES HAVE THE STRING LITERAL '* /'
   #         YOU MUST REMOVE THAT SPACE WHEN YOU RUN THESE
    SearchAndReplace.setSearchString("/*C* /");
    SearchAndReplace.setReplaceString("/*C* / //");
    SearchAndReplace.setBeanShellReplace(false);
    SearchAndReplace.setIgnoreCase(true);
    SearchAndReplace.setRegexp(false);
    SearchAndReplace.setSearchFileSet(new CurrentBufferSet());
    SearchAndReplace.replaceAll(view);
    SearchAndReplace.setSearchString("//console.");
    SearchAndReplace.setReplaceString("////console.");
    SearchAndReplace.setBeanShellReplace(false);
    SearchAndReplace.setIgnoreCase(true);
    SearchAndReplace.setRegexp(false);
    SearchAndReplace.setSearchFileSet(new CurrentBufferSet());
    SearchAndReplace.replaceAll(view);

   # Beanshell: Turn logging on by uncommenting the lines.
   # NOTICE: THE FIRST AND SECOND LINES HAVE THE STRING LITERAL '* /'
   #         YOU MUST REMOVE THAT SPACE WHEN YOU RUN THESE
    SearchAndReplace.setSearchString("/*C* / //");
    SearchAndReplace.setReplaceString("/*C* /");
    SearchAndReplace.setBeanShellReplace(false);
    SearchAndReplace.setIgnoreCase(true);
    SearchAndReplace.setRegexp(false);
    SearchAndReplace.setSearchFileSet(new CurrentBufferSet());
    SearchAndReplace.replaceAll(view);
    SearchAndReplace.setSearchString("////console.");
    SearchAndReplace.setReplaceString("//console.");
    SearchAndReplace.setBeanShellReplace(false);
    SearchAndReplace.setIgnoreCase(true);
    SearchAndReplace.setRegexp(false);
    SearchAndReplace.setSearchFileSet(new CurrentBufferSet());
    SearchAndReplace.replaceAll(view);
\* ================================================================== */
    
    
/****O* Javascript-API/x6events
*
* NAME
*   x6events
*
* FUNCTION
*   The javascript object x6events implements the classic
*   event listener and dispatcher pattern.
*
*   Objects can subscribe to events by name.  Other 
*   objects can notify the events object when an event
*   fires, and it will in turn notify all of the subscribers.
*
* PORTABILITY
*   The u.events object and its methods expect other u
*   methods to be available, but do not have any other
*   dependencies.
*
******
*/
var x6events = {
    /****iv* events/subscribers
    *
    * NAME
    *   u.events.subscribers
    *
    * FUNCTION
    *   The javascript object x6events.subscribers is an object
    *   serving as an Associative Array.  Each entry in the array
    *   has a key that is the name of the event, and a value that
    *   is an array of object ids for the subscribers.  In JSON
    *   format the array might look like this:
    *
    *       u.events.subscribers = {  // example code only
    *           keyPress_Enter: { 
    *              gridEdit_regrules: 'gridEdit_regrules'
    *           }
    *           addRow_customers: {
    *              gridBrowse_customers: 'gridBrowse_customers'
    *           }
    *       }
    *
    *   This object is documented for completeness only, it is
    *   not intended for direct manipulation.
    * 
    ******
    */
    subscribers: { },

    /****m* x6events/subscribeToEvent
    *
    * NAME
    *   x6events.subscribeToEvent
    *
    * FUNCTION
    *   The Javascript method x6events.subscribeToEvent allows an
    *   object to subscribe to a named event.  That object will
    *   then be notified whenever the event fires.  See the
    *   method x6events.notify for more information on how
    *   the notification is handled.
    *
    * INPUTS
    *   * eventName - Any string.  There is no validtion of the 
    *   eventName, so misspellings will result in your object 
    *   not being notified.
    *   * id - the Id of the object
    *   
    * NOTES
    *
    * RESULT
    *   No return value
    *
    * SEE ALSO
    *   x6events.fireEvent
    *
    * SOURCE
    */
    subscribeToEvent: function(eventName,id) {
        /*C*/ // var ux=u.uniqueId(); //console.group("subscribeToEvent "+ux);
        //console.log("event name: ",eventName)
        //console.log("id subscbr: ",id);
        if(id=='undefined') {
            u.error('x6events.subscribeToEvent.  Second parameter '
                +' undefined.  First parameter: '+eventName
            );
            return;
        }
        if(id==null) {
            u.error('x6events.subscribeToEvent.  Second parameter '
                +' null.  First parameter: '+eventName
            );
            return;
        }
        
        // First determine if we have any listeners for this
        // event at all.  If not, make up the empty object
        if( u.p(this.subscribers,eventName,null)==null) {
            this.subscribers[eventName] = [ ];
        }
        this.subscribers[eventName].push(id);
        /*C*/ // //console.groupEnd("subscribeToEvent "+ux);
    },
    /******/
        
    /****m* events/getSubscribers
    *
    * NAME
    *   x6events.getSubscribers
    *
    * FUNCTION
    *   The Javascript method x6events.getSubscribers returns
    *   an array of subscribers to a particular event.
    *
    * NOTES
    *   Use this method to discover which objects are
    *   subscribed to a particular event.
    *
    * RETURNS
    *   An array of zero or more object id's. 
    *
    * SOURCE
    */
    getSubscribers: function(eventName) {
        return u.p(this.subscribers,eventName,[]);
    },
    /******/

    /****m* x6events/fireEvent
    *
    * NAME
    *   x6events.fireEvent
    *
    * FUNCTION
    *   The Javascript method x6events.fireEvent will notify all
    *   objects that have subscribed to an event.  Each subscribing
    *   object must have a either:
    *   * a method named receiveEvents(eventName,args)
    *   * a method named receiveEvent_{EventName}(args)
    *
    *   If you want your application objects to notify other objects
    *   of its own events, call this function.
    *
    * INPUTS
    *   * eventName, the name of the event
    *   * mixed, a single argument.  If multiple arguments are required,
    *   pass an object that contains property:value assignments or 
    *   an array.  The only requirement for the argument is that the
    *   listeners know what to expect.
    *
    * RESULTS
    *   no return value.
    *
    ******
    */
    retvals: { },
    fireEvent: function(eventName,arguments) {
        /*C*/ // var ux=u.uniqueId(); //console.group("fireEvent "+eventName+' '+ux);
        //console.log('arguments: ',arguments);
        // Find out if anybody is listening for this event
        var subscribers = this.getSubscribers(eventName);
        
        // loop through subscribers.  Note at the bottom of the list
        // that if an event handler returns false we must stop.
        this.retvals[eventName] = true;
        for(var x in subscribers) {
            var id = subscribers[x];
            //console.log("subscriber: ",id);
            var subscriber = u.byId(id);
            if(subscriber==null) {
                u.error("There is no object with that ID, cannot dispatch");
                continue;
            }
            
            // First possibility is a generic nofity handler
            var retval = false;
            var method = 'receiveEvent_'+eventName;
            if(typeof(subscriber[method])=='function') {
                retval = subscriber[method](arguments);
            }
            else {
                u.error("Subscriber has no method: ",method); 
            }
            if(retval==false) {
                this.retvals[eventName] = false;
                break;
            }
        }
        //console.log("RETURNING: ",this.retvals[eventName]);
        /*C*/ // //console.groupEnd("fireEvent "+ux);
        return this.retvals[eventName];
    }
}
/* **************************************************************** *\

   X6 Data Dictionary
   
\* **************************************************************** */
var x6dd = {
    tables: { }
}

/* **************************************************************** *\

   X6 Object
   
\* **************************************************************** */
var x6 = {
    // Find all plugins in the x6plugins object.  Find all
    // DOM elements with property x6plugIn=xxx.  
    // Invoke the constructor for each one.
    init: function() {
        //u.debugFlag = true;
        
        // Job 1: Activate all of the plugins
        for(var plugInId in x6plugins) {
            $('[x6plugIn='+plugInId+']').each(function() {
                    if(u.p(this,'id','')=='') {
                        this.id = u.uniqueId();
                    }
                    u.debug(
                        "Initializing object "+this.id+" as plugIn "+plugInId
                    );
                    this.zTable = u.p(this,'x6table');
                    x6plugins[plugInId](this,this.id,u.p(this,'x6table'));
            });
        }
        
        // Job 2, activate a global keyboard handler
        $(document).keypress(function(e) {
                u.debug("document.keypress (BEGIN)",1); 
                var retval= x6.keyDispatcher(e);
                u.debug("document.keypress (END)",-1); 
                return retval;
        });
        
        // Fade in anybody who has been asked to fade in,
        // and when finished put focus onto whichever
        // object has asked for it.
        $('.fadein').fadeIn('slow',function() { x6.initFocus(); });
    },
    
    initFocus: function() {
        $('[x6firstFocus=Y]:last').focus();
    },
    
    // Keyboard handler
    keyDispatcher: function(e) {
        var x = e.keyCode;
        
        // First make a big list of codes and look for the event
        var x4Keys = { };
        x4Keys['8']  = 'BackSpace';
        x4Keys['9']  = 'Tab';
        x4Keys['13'] = 'Enter';
        //x4Keys['16'] = '';   // actually Shift, but prefix will take care of it
        //x4Keys['17'] = '';   // actually Ctrl,  but prefix will take care of it
        //x4Keys['18'] = '';   // actually Alt,   but prefix will take care of it
        x4Keys['16'] = 'Shift';
        x4Keys['17'] = 'Ctrl';
        x4Keys['18'] = 'Alt';
        x4Keys['20'] = 'CapsLock';
        x4Keys['27'] = 'Esc';
        x4Keys['33'] = 'PageUp';
        x4Keys['34'] = 'PageDown';
        x4Keys['35'] = 'End';
        x4Keys['36'] = 'Home';
        x4Keys['37'] = 'LeftArrow';
        x4Keys['38'] = 'UpArrow';
        x4Keys['39'] = 'RightArrow';
        x4Keys['40'] = 'DownArrow';
        x4Keys['45'] = 'Insert';
        x4Keys['46'] = 'Delete';
        x4Keys['112']= 'F1' ;
        x4Keys['113']= 'F2' ;
        x4Keys['114']= 'F3' ;
        x4Keys['115']= 'F4' ;
        x4Keys['116']= 'F5' ;
        x4Keys['117']= 'F6' ;
        x4Keys['118']= 'F7' ;
        x4Keys['119']= 'F8' ;
        x4Keys['120']= 'F9' ;
        x4Keys['121']= 'F10';
        x4Keys['122']= 'F11';
        x4Keys['123']= 'F12';
    
        // If they did not hit a control key of some sort, look
        // next for letters
        var retval = '';
        if(typeof(x4Keys[x])!='undefined') {
            retval = x4Keys[x];
        }
        else {
            var letters = 
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G',
                  'H', 'I', 'J', 'K', 'L', 'M', 'N',
                  'O', 'P', 'Q', 'R', 'S', 'T', 'U',
                  'V', 'W', 'X', 'Y', 'Z' ];
            var numbers = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
            if(e.charCode >= 65 && e.charCode <= 90) {
                retval = letters[e.charCode - 65];
            }
            else if(e.charCode >= 97 && e.charCode <= 121) {
                retval = letters[e.charCode - 97];
            }
            else if(e.charCode >= 48 && e.charCode <= 57) {
                retval = numbers[e.charCode - 48];
            }
        }
    
        // otherwise put on any prefixes and return
        if(e.ctrlKey)  retval = 'Ctrl'  + retval;
        // KFD 8/4/08, this never worked, removed.
        if(e.altKey)   retval = 'Alt'   + retval;
        if(e.shiftKey) retval = 'Shift' + retval;
        
        // Make list of keys to stop no matter what
        var stopThem = [ 'CtrlF5', 'F10' ];
        
        // Now we have a complete key label, fire the event
        u.debug("In x6.keyDispatch, code and event follow");
        u.debug(retval);
        u.debug(e);
        if(stopThem.indexOf(retval)>0) {
            u.debug("x6.keyDispatch: key is in force stop list, stopping propagation.");
            e.stopPropagation();
            return false;
        }
        else if (!x6events.fireEvent('key_'+retval,null)) {
            u.debug("x6.keyDispatch: handler returned false, stopping propagation.");
            e.stopPropagation();
            return false;
        }
        else {
            u.debug("x6.keyDispatch: handler returned true, continuing propagation.");
            return true;
        }
    }    
}

/* **************************************************************** *\

   Universal x6 input keyup handler
   
\* **************************************************************** */
var x6inputs = {
    // Key up is used to look for changed values because
    // you do not see an input's new value until the keyup 
    // event.  You do not see it in keypress or keydown.
    keyUp: function(e,inp) {
        x6inputs.setClass(inp);
    },
    
    // Keydown is used only for tab or shift tab, to enforce
    // the concept of a "tab loop".  This function only does
    // anything if there are no enabled controls after the
    // 
    //
    keyDown: function(e,inp) {
        //u.debugPush();
        ////console.log(e);
        //u.debug(e);
        //u.debug(inp);
        if(e.keyCode!=9) return true;
        
        // work out which property to use.
        if(e.shiftKey) { 
            var prop = 'xPrevTab';
            var jqf  = ':last';
        }
        else {
            var prop = 'xNextTab';
            var jqf  = ':first';
        }
        //u.debug(prop);
        //u.debug(jqf);
        
        // The loop breaks when we find a readable control
        // or get to the end of the list
        var xinp = inp;
        var jqx  = '';
        while(true) {
            // Current control has no next tab, start over
            // at beginning
            if( u.p(xinp,prop,'X')=='X') {
                jqx = '[tabindex]:not([disabled])'+jqf;
                //u.debug("no control found, string to use: "+jqx);
                break;
            }
            
            // Advance to next
            var tabCandidate = u.p(xinp,prop);
            jsq = '[tabindex='+tabCandidate+']';
            //u.debug('advancing to '+jsq);
            xinp = $(jsq)[0];
            
            // and if the next is not disabled, return TRUE,
            // do NOTHING, and the browser will handle it
            if(u.p(xinp,'disabled',false)==false) {
                //u.debug("next control is not read only, letting browse do it");
                break;
            }
            
            // if we get around to the original input, something
            // is wrong, cancel also so we don't have an 
            // infinite loop
            if(xinp==inp) break;
        }
        if(jqx=='') {
            //u.debug('not trying to pick focus');
        }
        else {
            //u.debug("trying to pick focus: "+jqx);
            $(jqx).focus();
        }
        //u.debugPop();
        if(jqx=='') {
            return true;
        }
        else {
            e.preventDefault();
            return false;
        }
    },
    
    focus: function(inp) {
        inp.zSelected = 1;
        x6inputs.setClass(inp);
    },
    xFocus: function(anyObject) {
        $(this).addClass('selected');
    },
    
    blur: function(inp) {
        inp.zSelected = 0;
        x6inputs.setClass(inp);
    },
    xBlur: function(anyObject) {
        $(anyObject).removeClass('selected');
    },
    
    setClass: function(inp) {
        if(u.p(inp,'zOriginalValue',null)==null) inp.zOriginalValue = '';
        if(inp.value==inp.zOriginalValue) {
            inp.zChanged = 0;
        }
        else {
            inp.zChanged = 1;
        }
        
        // First grab the flags that determine
        // what we will do
        var zSelected = u.p(inp,'zSelected',0);
        var zChanged  = u.p(inp,'zChanged', 0);
        var zError    = u.p(inp,'zError'  , 0);
        var zRO       = u.p(inp,'zRO'     , 0);
        var zNew      = u.p(inp,'zNew'    , 0);
        
        // now pick them in order of preference,
        // we only pick one stem.
        if     (zRO)      css = 'readOnly';
        else if(zError)   css = 'error';
        else if(zNew)     css = 'changed';
        else if(zChanged) css = 'changed';
        else              css = '';
        
        // Now pick the selected version if required
        if(zSelected) css += 'Selected';
        
        // Now do some stuff if it is read only
        inp.disabled = zRO;
        
        // Flag to do the row
        doRow = u.p(inp,'xClassRow',0);
            
        // Now set the class name
        inp.className = css;
        if(doRow && zSelected) {
            inp.parentNode.parentNode.className = 'selected';
        }
        if(doRow && !zSelected) {
            inp.parentNode.parentNode.className = '';
        }
    },
    
    clearOut: function(inp) {
        inp.zRO            = 1;
        inp.zNew           = 0;
        inp.zSelected      = 0;
        inp.value          = '';
        inp.zOriginalValue = '';
        x6inputs.setClass(inp);
    }
}



/* **************************************************************** *\

   X6 Builtin plugins
   
\* **************************************************************** */

/****O* Javascript-API/x6plugins
*
* NAME
*   x6plugins
*
* FUNCTION
*   The javascript object x6plugins is a collection of functions.
*   Each function is a 'constructor'.
*  
*
******
*/
var x6plugins = {
    buttonNew: function(self,id,table) {
        x6plugins.buttonStandard(self,'new','CtrlN');
        self.main = function() {
            x6events.fireEvent('reqNewRow_'+this.zTable);   
        }
    },
    buttonDuplicate: function(self,id,table) {
        x6plugins.buttonStandard(self,'duplicate','CtrlD');
        self.main = function() {
            x6events.fireEvent('reqNewRow_'+this.zTable,true);   
        }
    },
    buttonRemove: function(self,id,table) {
        x6plugins.buttonStandard(self,'remove','CtrlR');
        self.main = function() {
            x6events.fireEvent('reqDelRow_'+this.zTable);
        }
    },
    buttonAbandon: function(self,id,table) {
        x6plugins.buttonStandard(self,'abandon','CtrlT');
        self.main = function() {
            if(confirm("Abandon all changes?")) {
                x6events.fireEvent('cancelEdit_'+this.zTable);
            }
        }
    },
    buttonSave: function(self,id,table) {
        x6plugins.buttonStandard(self,'save','CtrlS');
        self.main = function() {
            x6events.fireEvent('reqSaveRow_'+this.zTable);
        }
    },
    /****m* x6plugins/buttonStandard
    *
    * NAME
    *   x6plugins.buttonStandard
    *
    * FUNCTION
    *   The Javascript method buttonStandard gives a button 
    *   object the standard behavior of responding to 
    *   a single keystroke and responding to enable/disable
    *   commands.
    * 
    *   Use this function when you create a custom button to
    *   put onto the screen.
    *
    *   A custom button requires a uniquely named 'action' and
    *   a hotkey.  Actions reserved by andromeda are:
    *   *  duplicate
    *   *  new
    *   *  remove
    *   *  save
    *
    * EXAMPLE
    *   A custom button is created in PHP code like so:
    *
    *    <?php
    *    # option 1, straight html
    *    <input type='button' x6plugIn='buttonMine' x6table='example'>
    *
    *    # option 2, or a link
    *    $div = html('div');
    *    $a = $div->h('a-void','My Action');
    *    $a->hp['x6plugIn'] = 'buttonMine';
    *    $a->hp['x6table'] = 'example';  // only if relevant
    *    ?>
    *
    *   Then you define a javascript x6plugIn that includes a 
    *   single function, main(), which is called when the button
    *   is enabled and is clicked or the hotkey is pressed.
    *
    *     <script>
    *     x6plugins.buttonMine = function(self,id,table) {
    *         // the first line activates normal behavior, 
    *         // replace the values in this line with those
    *         // appropriate to your button.
    *         x6plugins.buttonStandard(self,'save','CtrlS');
    *
    *         // Then create the main function 
    *         self.main = function() {
    *            // fire off some event
    *         }
    *     }
    *     </script>    
    *
    ******/
    buttonStandard: function(self,action,key) {
        // Assume everything starts out enabled
        self.zDisabled = false;
        self.zTable    = u.p(self,'x6table');
        self.zAction   = action;
        self.zKey      = key;
        
        // Respond to an enable event
        x6events.subscribeToEvent('enable_'+action,self.id);
        self['receiveEvent_enable_'+action] = function() {
            this.className = 'button';
            this.zDisabled = false;
        }

        // Respond to an disable event
        x6events.subscribeToEvent('disable_'+action,self.id);
        self['receiveEvent_disable_'+action] = function() {
            this.className = 'button_disabled';
            this.zDisabled = true;
        }
        
        // Create an empty main routine to be replaced
        // button by button.  Put out a useful error message
        // when they have not 
        self.main = function() {
            u.error("Button "+this.id+", handling action "+this.zAction
                +" and keypress "+this.zKey+" has no main() function."
            );
        }
        // Respond to a keypress event
        x6events.subscribeToEvent('key_'+key,self.id);
        self['receiveEvent_key_'+key] = function() {
            if(!this.zDisabled) this.main();
            // if a key event is received, we *always* stop 
            // propagation
            x6events.retvals['key_'+this.zKey] = false;
        }
        
        // finally of course set the onclick method
        $(self).click(function() { 
            if(!this.zDisabled) this.main(); 
        });
    },
    
    /****m* x6plugins/tableController
    *
    * NAME
    *   x6plugins.tableController
    *
    * FUNCTION
    *   The Javascript method x6plugins.tableController is
    *   a constructor function.  It accepts as a parameter the
    *   ID of a DOM element.  It adds functions to that DOM 
    *   element so that it will fully implement all browser-side
    *   features of our tableController object.
    *
    *   A tableController subscribes to all events in which a
    *   user requests to do something like add a row or delete
    *   a row.  The tableController executes whatever server-side
    *   requests are required, and then fires various events to
    *   notify other UI elements that they should display the
    *   results.
    * 
    *   Normally you do not invoke this method directly.  All 
    *   x6 plugins are detected and implmented automatically on
    *   page load.
    
    *   To turn any DOM element into a table controller, just set
    *   the properties x6plugIn and x6table, as in either
    *   of these:
    *
    *      <?php
    *      # here is one way to do it:
    *      echo "<div x6plugIn='tableController' x6table='users'>";
    *
    *      # another way to do it:
    *      $div = html('div');
    *      $div->hp['x6plugIn'] = 'tableController';
    *      $div->hp['x6table'] = 'users';
    *      $div->render();
    *      ?>
    *
    *   You should not have more than one table controller per 
    *   table on a page -- Andromeda will not trap for this!
    *
    * INPUTS
    *   id - the ID of the object to be 'activated'.
    *
    * RESULTS
    *   no return value.
    *
    ******
    */
    tableController: function(self,id,table) {
        // Initialize new properties
        self.zSkey    = -1;
        self.zSortCol = false;
        self.zSortAsc = false;
        
        // Table Controller will cache rows if offered
        x6events.subscribeToEvent('cacheRows_'+table,id);
        self['receiveEvent_cacheRows_'+table] = function(rows) {
            this.zRows = rows;
        }
        // Table Controller will add a row to cache if offered
        x6events.subscribeToEvent('addRow_'+table,id);
        self['receiveEvent_addRow_'+table] = function(row) {
            this.zRows[row.skey] = row;
        }
        
        // Handle a new row by generating defaults and telling
        // anybody who cares to display this row in this mode
        x6events.subscribeToEvent('reqNewRow_'    +table,id);
        self['receiveEvent_reqNewRow_'+table] = function(dupeCurrent) {
            if( x6events.fireEvent('attemptChangeMode_'+u.p(this,'x6table'))) {
                if(dupeCurrent && this.zSkey >0) {
                    var row = this.zRows[this.zSkey];
                }
                else {
                    var row = { }
                }
                var argsObj = {
                    mode: 'new',
                    row: row
                };
                x6events.fireEvent('goMode_'+u.p(this,'x6table'),argsObj);
                this.zSkey=0;
            }
        }

        // table controller responds to request to edit a 
        // particular row.
        x6events.subscribeToEvent('reqEditRow_'   +table,id);
        self['receiveEvent_reqEditRow_'+table] = function(skey) {
            if( x6events.fireEvent('attemptChangeMode_'+u.p(this,'x6table'))) {
                var argsObj = {
                    mode: 'edit',
                    row: this.zRows[skey]
                };
                x6events.fireEvent('goMode_'+u.p(this,'x6table'),argsObj);
                this.zSkey = skey;
            }
        }
        
        // table controller responds to an abandon event
        x6events.subscribeToEvent('cancelEdit_'+table,id);
        self['receiveEvent_cancelEdit_'+table] = function() {
            // If we were on a new row, abandon it.  Otherwise
            // take no action
            if(this.zSkey==0) this.zSkey = -1;
        }
        

        x6events.subscribeToEvent('reqDelRow_'    +table,id);
        self['receiveEvent_reqDelRow_'+table] = function() {
            if(this.zSkey==-1) {
                alert("Please click on a row first, then click [DELETE]");
                return false;
            }
            var table = u.p(this,'x6table');
            ua.json.init('x6page',table);
            ua.json.addParm('x6action','delete');
            ua.json.addParm('skey',this.zSkey);
            ua.json.addParm('json',1);
            if(ua.json.execute()) {
                // Remove from cache
                if(typeof(this.zRows[this.zSkey])!='undefined') {
                    delete this.zRows[this.zSkey];
                }
                
                // Tell everybody else to get rid of it
                x6events.fireEvent('delRow_'+table,this.zSkey);
                this.skey = -1;
            }
            return;
        }
        
        x6events.subscribeToEvent('rowChanged_'+table,id);
        self['receiveEvent_rowChanged_'+table] = function(row) {
            var skey = row.skey;
            this.zRows[skey] = row;
        }

        // Sort requests are sorted out here.        
        x6events.subscribeToEvent('reqSort_'+table,id);
        self['receiveEvent_reqSort_'+table] = function(args) {
            // Work out sort order
            table = this.zTable
            xColumn = args.xColumn;
            xChGroup= args.xChGroup;
            if(xColumn == this.zSortCol) {
                this.zSortAsc = ! this.zSortAsc;
            }
            else {
                this.zSortCol = xColumn;
                this.zSortAsc = true;
            }
            
            // Flip all icons to both
            $('[xChGroup='+xChGroup+']').html('&uarr;&darr');
            
            // Flip just this icon to up or down
            var icon = this.zSortAsc ? '&darr;' : '&uarr;';
            $('[xChGroup='+xChGroup+'][xColumn='+xColumn+']').html(icon);
            
            // Make the request to the server
            var args2 = { sortCol: this.zSortCol, sortAsc: this.zSortAsc };
            x6events.fireEvent('doSort_'+this.zTable,args2);
        }
        

    },
    
    /****m* x6plugins/grid 
    * NAME
    *   x6plugins.grid
    *
    ******/
    grid: function(self,id,table) {
        
        // Subscribe to deletion event
        x6events.subscribeToEvent('delRow_'+table,id);
        self['receiveEvent_delRow_'+table] = function(skey) {
            $(this).find('#row_'+skey).fadeOut(function() {
                    $(this).remove();
            });
        }
        
        // Grid accepts an addrow and requests some html from
        // the server, then interprets it as a goMode
        //
        x6events.subscribeToEvent('addRow_'+table,id);
        self['receiveEvent_addRow_'+table] = function(row) {
            ua.json.init('x6page',this.zTable);
            ua.json.addParm('x6plugIn',u.p(this,'x6plugIn'));
            ua.json.addParm('x6action','onerow');
            ua.json.addParm('skey',row.skey);
            if(ua.json.execute()) {
                var html = ua.json.jdata.html['*MAIN*'];
                $(this).find('.tbody').prepend(html);
                this['receiveEvent_goMode_'+table]({mode:'edit',row:row});
            }
        }
        
        // Grid accepts a notification that we are actually
        // editing a row or reviewing a row
        x6events.subscribeToEvent('goMode_'+table,id);
        self['receiveEvent_goMode_'+table] = function(args) {
            // In all cases, turn off any rows that are selected
            $(this).find('.tbody .selected')
                .removeClass('selected')
                .removeClass('hilight');
            
            // If there is a new row, turn that one on
            if(args.mode == 'edit') {
                $(this).find('#row_'+args.row.skey)
                    .removeClass('hilight')
                    .addClass('selected');
            }
        }

        // Grid responds to request to sort in a particular order
        x6events.subscribeToEvent('doSort_'+table,id);
        self['receiveEvent_doSort_'+table] = function(args) {
            ua.json.init('x6page',this.zTable);
            ua.json.addParm('x6plugIn',u.p(this,'x6plugIn'));
            ua.json.addParm('x6action','refresh');
            ua.json.addParm('sortCol',args.sortCol);
            ua.json.addParm('sortAsc',args.sortAsc);
            u.dialogs.pleaseWait();
            if(ua.json.execute(true)) {
                var html = ua.json.jdata.html['*MAIN*'];
                $(this).find('.tbody').replaceWith(html);
            }
            u.dialogs.clear();
        }
        
        // First keyboard event, keydown
        x6events.subscribeToEvent('key_UpArrow',id);
        self.receiveEvent_key_UpArrow = function(e) {
            var jqRows = $(this).find('.hilight').prev();
            if(jqRows.length==0) {
                $(this).find('tbody tr:first').addClass('hilight');
            }
            else {
                $(this).find('tbody tr.hilight').removeClass('hilight')
                    .prev().addClass('hilight');
            }
            x6events.retvals['key_UpArrow'] =false;
        }
        x6events.subscribeToEvent('key_DownArrow',id);
        self.receiveEvent_key_DownArrow = function(e) {
            var jqRows = $(this).find('.hilight').next();
            if(jqRows.length==0) {
                $(this).find('tbody tr:first').addClass('hilight');
            }
            else {
                $(this).find('.hilight').removeClass('hilight')
                    .next().addClass('hilight');
            }
            x6events.retvals['key_UpArrow'] =false;
        }
        
        
    },
    
    /****m* x6plugins/detailDisplay
    *
    * NAME
    *   x6plugins.detailDisplay
    *
    * FUNCTION
    *   The Javascript method x6plugins.detailDisplay implements
    *   all browser-side functionality for Andromeda's built-in
    *   plugIn detailDisplay.
    *
    *   A 'detailDisplay' plugIn displays user inputs to edit
    *   the values for a particular row in a table.  
    *
    *   This plugin subscribes to the following events:
    *   *  goMode_{table}
    *
    * INPUTS
    *   self - the DOM object to be activated.
    *   id - the ID of the object to be 'activated'.
    *   table - the database table that the detailPane is handling.
    *
    * RESULTS
    *   no return value.
    *
    ******
    */
    detailDisplay: function(self,id,table) {
        self.zSkey = -1;
        
        // detail receives a request to attempt to go into a 
        // mode.  It checks to see if a save is required first.
        x6events.subscribeToEvent('attemptChangeMode_'+table,id);
        self['receiveEvent_attemptChangeMode_'+table] = function() {
            // Check for existing row with changes
            if(this.zSkey>=0) {
                var ichg = $(this).find(":input[zChanged=1]");
                if(ichg.length > 0) {
                    alert("There are changed Values.  Must save first");
                    return false;
                }
            }
            return true;
        }
        
        // Detail receives an addRow event and interprets it
        // as a goMode
        x6events.subscribeToEvent('addRow_'+table,id);
        self['receiveEvent_addRow_'+table] = function(row) {
            this['receiveEvent_goMode_'+table]({mode:'edit',row:row});
        }

        // detail receives a request to go to a mode which
        // is unconditional, it will do what it is told
        x6events.subscribeToEvent('goMode_'+table,id);
        self['receiveEvent_goMode_'+table] = function(argsObj) {
            var mode = argsObj.mode;
            var row  = argsObj.row;
            
            if(mode!='new' && mode!='edit') {
                u.error("Object "+this.id+" has received a 'goMode' event "
                    +"for unhandled mode "+mode+".  Cannot process this "
                    +"request."
                );
            }

            // Set values and remember skey value
            x6events.fireEvent('enable_save');
            x6events.fireEvent('enable_abandon');
            if(mode=='new')  {
                x6events.fireEvent('disable_remove');
                x6events.fireEvent('disable_new');
                x6events.fireEvent('disable_duplicate');
                u.debug("detail display going into new mode");
                // For new rows, set defaults, otherwise blank
                // out.
                $(this).find(':input').each(function() {
                    this.value=u.p(this,'xdefault','');
                    this.zOriginalValue = this.value;
                    this.zChanged = 0;
                });
                if(typeof(row.skey)!='undefined') {
                    u.debug("detail display populating inputs");
                    this.populateInputs(row);
                }
                this.zSkey = 0;
            }
            else {
                x6events.fireEvent('enable_remove');
                x6events.fireEvent('enable_new');
                x6events.fireEvent('enable_duplicate');
                this.populateInputs(row);
                this.zSkey = row.skey;
            }
            
            
            // now set the readonly and new flags on all controls
            $(this).find(':input').each(function() {
                this.zNew = mode=='new' ? 1 : 0;
                if(mode=='new') {
                    var ro = u.p(this,'xroins','N');
                }
                else {
                    var ro = u.p(this,'xroupd','N');
                }
                if(ro=='Y') {
                    this.zRO = 1;
                    this.disabled = true;
                }
                else {
                    this.zRO = 0;
                    this.disabled = false;
                }
                x6inputs.setClass(this);
            });
            $(this).find(':input:not(.readOnly):first').focus();
        }
    
        
        // detail responds to cancel edit command.  If we were
        // entering new row we clear everything, otherwise we
        // just restore original values
        x6events.subscribeToEvent('cancelEdit_'+table,id);
        self['receiveEvent_cancelEdit_'+table] = function() {
            if(this.zSkey==0) {
                x6events.fireEvent('disable_save');
                x6events.fireEvent('disable_abandon');
                x6events.fireEvent('disable_remove');
                x6events.fireEvent('enable_new');
                x6events.fireEvent('disable_duplicate');
                u.debug("skey is zero, clearing out");
                // clear it all out
                $(this).find(":input").each(function() {
                        x6inputs.clearOut(this);
                });
                x6.initFocus();
            }
            else {
                x6events.fireEvent('enable_save');
                x6events.fireEvent('enable_abandon');
                x6events.fireEvent('enable_remove');
                x6events.fireEvent('enable_new');
                x6events.fireEvent('enable_duplicate');
                // restore original values
                u.debug("Skey is: "+this.zSkey+", restoring original values");
                $(this).find(":input").each(function() {
                    this.value = this.zOriginalValue;
                    x6inputs.setClass(this);
                });
            }
        }
        
        
        // Detail accepts a request to delete a row by skey
        x6events.subscribeToEvent('delRow_'+table,id);
        self['receiveEvent_delRow_'+table] = function(skey) {
            // <--- early return.  If not our skey, ignore
            if(skey!=this.zSkey) return true;
            
            $(this).find(':input').each(function() {
                    this.value = '';
                    this.zOriginalValue = '';
                    this.zChanged = 0;
                    this.className = 'readOnly';
            });
        }
        
        // Detail accepts a request to save row and tries to 
        // do so
        x6events.subscribeToEvent('reqSaveRow_'+table,id);
        self['receiveEvent_reqSaveRow_'+table] = function(argsObj) {
            // <--- Early return if nothing to do.  This stays in
            //      even if we disable the key appropriately, so that
            //      it is more robust.
            if(this.zSkey==-1) return true;
            // <--- Early return if no fields changed
            var inps = $(this).find(':input[zChanged=1]');
            if(inps.length==0) return true;
            
            var table = u.p(this,'x6table');
            ua.json.init('x6page',table);
            ua.json.addParm('x6action','save');
            ua.json.inputs(this);
            ua.json.addParm('x4v_skey',this.zSkey);
            if(ua.json.execute()) {
                // process and capture the returned row
                ua.json.process();
                var newvals = $a.data.row;
                
                // Publish the event as either a new row
                // or an updated row.
                if(this.zSkey==0) {
                    x6events.fireEvent('addRow_'+table,newvals);
                }
                else {
                    x6events.fireEvent('rowChanged_'+table,newvals);
                    x6events.fireEvent(
                        'goMode_'+table,{mode:'edit',row:newvals}
                    );
                }
            }
        }
        
        // Accept a row changed event 
        //x6events.subscribeToEvent('rowChanged_'+table,id);
        //self['receiveEvent_rowChanged_'+table] = function(newvals) {
        //    this.populateInputs(newvals);  
        //}
        
        // --------------------------------------------------------
        //
        self.populateInputs = function(row) {
            $(this).find(":input").each(function() {
                    this.zOriginalValue = '';
                    this.zChanged       = false;
            });
            for(var colname in row) {
                var val = row[colname];
                colname=colname.trim();
                var jqobj =$(this).find(':input[xcolumnid='+colname+']');
                if(jqobj.length>0) {
                    if(val==null) val='';
                    jqobj[0].value          = val;
                    jqobj[0].zOriginalValue = val;
                    jqobj[0].zChanged       = false;
                }
            }
        }
    }
}