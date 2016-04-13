<%--
Copyright 2014  IBM Corp. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
--%>
<%@ page session="false" buffer="none" %>
<%--  --%>

<%--
     NOTE: This file is a fallback minimal skin to recover from a severe portal error.
     It renders the minimum required to navigate to administration and try to fix the problem. 
     This skin does not include all skin functionality and should not be used as the basis 
     for a production skin. Production skins should contain all their files inside their 
     own directory. 
--%>
<%@ include file="./includePortalTaglibs.jspf" %>

<div style="overflow:auto;clear:both;border:1px solid grey;margin:5px;padding:5px;">
	<h2>
		<portal-skin:portletTitle>
			<span style="color:red;"><portal-fmt:problem bundle="nls.problem"/></span>
		</portal-skin:portletTitle>
	</h2>
	<div>
		<portal-skin:portletRender>
			<span style="color:red;"><portal-fmt:problem bundle="nls.problem"/></span>
		</portal-skin:portletRender>
	</div>
</div>