<%--
Copyright 2014  IBM Corp. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
--%>
<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<!DOCTYPE html>
<%-- 
NOTE: This file is a fallback minimal theme intended for use only to recover from a severe portal error.
It renders the minimum required to navigate to administration and try to fix the problem. This theme does not
include all portal functionality and should not be used as the basis for a production theme.
--%> 
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %> 
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.5/portal-core" prefix="portal-core" %>
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.5/portal-logic" prefix="portal-logic" %>
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.5/portal-fmt" prefix="portal-fmt" %>
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.5/portal-navigation" prefix="portal-navigation" %>
<portal-core:constants/><portal-core:defineObjects/>
<html>
<head>
	<title>
		<portal-fmt:text key="title" bundle="nls.engine"/>
	</title>
	<style>
	body {font-family:Arial, sans-serif;background-color:white;color:black;margin:0;padding:0;}
	a {text-decoration:none;}
	a:hover, a:focus, a:active {text-decoration:underline;}
	.stMainContent {padding:0.5em;}
	.stHeader {border-bottom:1px solid black;margin:0;padding:0.5em;}
	.stTitle {float:left;}
	.stToolbar {float:right;}
	.stSideNav{ white-space:nowrap;margin:0;padding:0.5em;}
	.stSideNav li{list-style: none;}
	.stNavItem {white-space:nowrap;padding:3px;display:block;}
	.stNavItem a {display:inline;}
	.stNavItem.stSelected a {display:inline;font-weight: bold;}
	</style>
</head>
<body>
<header class="stHeader" role="banner">
	<div>
		<div class="stTitle">
			<portal-fmt:text key="title" bundle="nls.engine"/>
		</div>
		<div class="stToolbar">
			<%-- LOG IN / OUT --%>
			<portal-logic:if loggedIn="yes">
			<a href='<portal-navigation:url command="LogoutUser"/>'>
				<portal-fmt:text key="link.logout" bundle="nls.engine"/>
			</a>
			</portal-logic:if>
			<portal-logic:if loggedIn="no">
			<portal-navigation:urlGeneration contentNode="wps.Login">
			<a href='<% wpsURL.write(escapeXmlWriter); %>'>
				<portal-fmt:text key="link.login" bundle="nls.engine"/>
			</a>
			</portal-navigation:urlGeneration>
			</portal-logic:if>
		</div>
		<div style="clear: both"></div>
	</div>
	<div>
		<portal-fmt:text key="error.template.not.found" bundle="nls.commonUI"/>
	</div>
</header>
<table style="width:100%; height:100%;" cellpadding="0" cellspacing="0" role="presentation">
<tr><td valign="top">
<%-- SIDE NAVIGATION --%>
<portal-navigation:navigation startLevel="1"><% int previousNavLevel=0;%><portal-navigation:navigationLoop>
<% boolean isNodeSelected=wpsSelectionModel.isNodeSelected(wpsNavNode);
String rowCssClass=isNodeSelected ? "stNavItem stSelected" : "stNavItem";
boolean nodeHasChildren=wpsNavModel.hasChildren(wpsNavNode);
boolean isExpanded=((Boolean)((com.ibm.portal.state.StateModel)wpsNavModel).getState(wpsNavNode, com.ibm.portal.state.StateType.EXPANSION)).booleanValue() ;
boolean openInNewWindow=com.ibm.portal.content.ContentNodeType.EXTERNALURL.equals(wpsNavNode.getContentNode().getContentNodeType());
boolean isLabel=com.ibm.portal.content.ContentNodeType.LABEL.equals(wpsNavNode.getContentNode().getContentNodeType());
int currentNavLevel=wpsNavLevel.intValue(); %> 
<c:choose><c:when test="<%=currentNavLevel > previousNavLevel%>"><% for(int i=currentNavLevel; i > previousNavLevel; i--){%><ul <% if(previousNavLevel==0){%> role="navigation" class="stSideNav"<%}%> ><%} %></c:when><c:when test="<%=currentNavLevel < previousNavLevel %>"><% for(int i=currentNavLevel; i < previousNavLevel; i++){%></ul></li><%} %></c:when></c:choose><li <% if (isNodeSelected) { %>id="portalSelectedNode" <% } %> ><span class="<%=rowCssClass%>">
<c:choose><c:when test="<%=nodeHasChildren && isExpanded %>"><a style="text-decoration:none" href='<portal-navigation:navigationUrl type="collapse"/>'>-</a></c:when><c:when test="<%=nodeHasChildren && !isExpanded %>"><a style="text-decoration:none" href='<portal-navigation:navigationUrl type="expand"/>'>+</a></c:when><c:otherwise><img alt="" src="<%=wpsBaseURL%>/images/dot.gif" /></c:otherwise></c:choose> 
<c:choose><c:when test="<%=isLabel%>"><span class="wpsNavLevel<%=wpsNavLevel%>"><portal-fmt:title/></span></c:when><c:otherwise><a class="<%=rowCssClass%> wpsNavLevel<%=wpsNavLevel%>" href="<portal-navigation:navigationUrl type="launch"/>" <% if (openInNewWindow) {%>target="_blank"<% } %> ><portal-fmt:title/></a></c:otherwise></c:choose></span>
<c:if test="<%=(!nodeHasChildren || !isExpanded)%>"></li></c:if><%previousNavLevel=currentNavLevel;%> 
</portal-navigation:navigationLoop>
<c:if test="<%=previousNavLevel > 0 %>"><% for(int i=previousNavLevel; i > 1; i--){%></ul></li><%} %></ul></c:if></portal-navigation:navigation><%-- end side navigation--%> 
</td>
<td width="100%" height="100%" valign="top">
<%-- MAIN CONTENT --%>
	<div class="stMainContent" role="main">
		<portal-core:screenRender/>
	</div>
</td>
</tr>
</table>
</body></html>