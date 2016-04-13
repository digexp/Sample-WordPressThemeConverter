<%--
Copyright 2014  IBM Corp. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
--%>
<%@ page session="false" buffer="none" %> 
<%@ page trimDirectiveWhitespaces="true" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.5/portal-core" prefix="portal-core" %>
<%@ taglib uri="http://www.ibm.com/xmlns/prod/websphere/portal/v8.5/portal-navigation" prefix="portal-navigation" %>

<%-- lazy load the selection path array --%>
<portal-core:lazy-set var="selectionPath" elExpression="wp.selectionModel.selectionPath"/>

<%-- start the navigation at level 1 --%>
<c:set var="curLevel" value="1"/>

<%-- get root node for this navigation --%>
<c:set var="rootNode" value="${selectionPath[curLevel]}"/> 

<portal-navigation:uiNavigationModel var="uiNavigationModel"> 

<%-- This is the container, update the node type to match the 'container' parameter, the class to match 'container_class', and the id to match 'container_id', if applicable --%>
<$container class="$container_class" id="$container_id"> 

	<%-- print out navigation if the selection path is not empty and children exist --%>
	<c:if test="${(fn:length(selectionPath) > curLevel) && uiNavigationModel.hasChildren[rootNode]}">

		<%-- This is the menu, update the class to match the 'menu_class parameter', if applicable --%>
		<ul class="$menu_class" id="menu-main-nav">

		<%-- loop through all children of the page at the given rootNode --%>
		<c:forEach var="node" items="${uiNavigationModel.children[rootNode]}">

			<li class="menu-item<c:if test="${node.isInSelectionPath}"> current-menu-item</c:if>" id="menu-item-${wp.identification[node.objectID]}">
				$before<a href="${fn:escapeXml(node.urlGeneration.autoNavigationalState)}">$link_before${node.title}$link_after</a>$after
			</li>

		</c:forEach>

		</ul>

	</c:if>

</$container>
</portal-navigation:uiNavigationModel>
