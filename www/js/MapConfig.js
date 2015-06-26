/*---------------------------------------------------------------------------
  Copyright 2011 ElectoralMap.net
  This software may not be reproduced, modified, or deployed to another site
  for any reason without express written permission of the copyright holder.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
---------------------------------------------------------------------------*/
   var g_map_backgroundColor = "transparent";        
   var g_map_backgroundColor2 ="#14ae00";
   var g_map_borderColor = "#5e7c55";           
   var g_map_highlightBorderColor = [94,124,85];

   var g_map_baseRGB = [172,194,166];       
   var g_map_highlightRGB = [152,173,147]; 

   var g_map_infoBoxFillRGB   = "#14ae00";
   var g_map_infoBoxBorderRGB = [20,174,0]; 
   var g_map_infoBoxTextRGB   = [255,255,255];     

   var g_map_useInfoBox = true;
   
   var g_map_stateMap = null;
   var g_map_canvas;
   var g_map_context;
   var g_map_renderInterval;
   var g_map_isIE9 = false;
   var trimap;
   var inv_trimap;

 
 
 
 
 	function map_userSetup()
   {




      for ( var abbrev in g_map_stateMap )
      {
         var state = g_map_stateMap[abbrev]; 
         var nameAndAbbrev = state.myPrettyName + "  (" + state.myAbbrev + ")";

         state.setInfoBoxText(nameAndAbbrev);
         state.myClickCallback = stateClicked;
         findCenterPoint(state);
      }



      map_State.prototype.electoralVotes = 0;
      map_State.prototype.electoralVotesR = 0;
      map_State.prototype.electoralVotesD = 0;
      map_State.prototype.centerX = 0;
      map_State.prototype.centerY = 0;

      loadElectoralVotes();
      loadSupplementalText();




      createTrimap();

      if ( user_data != undefined )
      {
         decompress(user_data);
      }


 	return;
   }

function stateClicked(x,y,state)
{
   if ( state.electoralVotesR )
   {
      state.electoralVotesD = state.electoralVotes;
      state.electoralVotesR = 0;
      state.myHighlightRGB = [4,136,247];
      state.myBaseRGB = [4,136,247];
   }
   else if ( state.electoralVotesD )
   {
      state.electoralVotesR = 0;
      state.electoralVotesD = 0;
      state.myHighlightRGB = [152,173,147];
      state.myBaseRGB = [172,194,166];
   }
   else 
   {
      state.electoralVotesR = state.electoralVotes;
      state.electoralVotesD = 0;
      state.myHighlightRGB = [236,35,39];
      state.myBaseRGB = [236,35,39];
   }

   state.updateColor(true);
   resum();
}

function resum()
{
   var urlString = "";
   var sumTossup = 0;
   var sumDem = 0;
   var sumRep = 0;

   for ( var abbrev in g_map_stateMap )
   {
      var state = g_map_stateMap[abbrev];

      if ( state.electoralVotesR )
      {
         sumRep += state.electoralVotes;
         urlString += "1";
      }
      else if ( state.electoralVotesD )
      {
         sumDem  += state.electoralVotes;
         urlString += "2";
      }
      else
      {
         sumTossup += state.electoralVotes;
         urlString += "0";
      }
   }


   var repString = "<H2 style=\"color:red;\">";
   var demString = "<H2 style=\"color:blue;\">";
   var tosString = "<H2 style=\"color:gray;\">";
   var termString = "</H2>";

   tosString = tosString + sumTossup + 
               "<span style=\"color:white;\">&#x2713;</span>" + termString;

   if ( sumRep >= 270 )
      repString = repString + sumRep + "&nbsp;" + termString;
   else
      repString = repString + sumRep + termString;

   if ( sumDem >= 270 )
      demString = demString + sumDem + "&nbsp;" + termString;
   else
      demString = demString + sumDem + termString;

   var repEle = document.getElementById("rtotal");
   var demEle = document.getElementById("dtotal");
   var tosEle = document.getElementById("ttotal");

   repEle.innerHTML = repString;
   demEle.innerHTML = demString;
   tosEle.innerHTML = tosString;
}

function compress(s)
{
   var newstr = "";
   for ( var i = 0; i < 51; i+=3 )
   {
      var substr = s.substring(i, i+3);
      var mapped = trimap[substr];
      newstr += mapped;
   }
   return newstr;
}

function decompress(s)
{
   if (s.length != 17)
      return;

   var newstr = "";
   for ( var i = 0; i < 17; i++ )
   {
      var mapped = inv_trimap[s.charAt(i)];
      newstr += mapped;
   }

   var i = 0;
   for ( var abbrev in g_map_stateMap )
   {
      var state = g_map_stateMap[abbrev];

      if ( newstr.charAt(i) == "2" )
      {
         state.electoralVotesD = state.electoralVotes;
         state.electoralVotesR = 0;
         state.myHighlightRGB = [4,136,247];
         state.myBaseRGB = [0,0,200];
      }
      else if ( newstr.charAt(i) == "1" )
      {
         state.electoralVotesR = state.electoralVotes;
         state.electoralVotesD = 0;
         state.myHighlightRGB = [152,173,147];
         state.myBaseRGB = [200,0,0];
      }
      else
      {
         state.electoralVotesR = 0;
         state.electoralVotesD = 0;
         state.myHighlightRGB = [236,35,39];
         state.myBaseRGB = [172,194,166];
      }

      state.updateColor();
      i++;
   }

   resum();

}


function loadSupplementalText()
{
   

      for ( var abbrev in g_map_stateMap )
      {
         var state = g_map_stateMap[abbrev];
         state.addInfoBoxText("" + state.electoralVotes + " Votes");
      }



}

function createTrimap()
{
   trimap = new Array();
   inv_trimap = new Array();

   var startingUnicode = 97;

   for ( var i = 0; i < 3; i++)
   {
      for ( var j = 0; j < 3; j++)
      {
         for ( var k = 0; k < 3; k++)
         {
            var base = "";
            base = base + i;
            base = base + j;
            base = base + k;

            trimap[base] = String.fromCharCode(startingUnicode);
            inv_trimap[String.fromCharCode(startingUnicode)] = base;

            startingUnicode++;
         }
      }
   }

   trimap["222"] = "0";
   inv_trimap["0"] = "222";
}

