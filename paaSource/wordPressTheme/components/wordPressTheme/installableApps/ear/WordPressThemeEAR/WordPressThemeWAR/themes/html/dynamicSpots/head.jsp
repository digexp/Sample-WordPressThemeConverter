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
<%@ include file="../includePortalTaglibs.jspf" %>
<portal-core:constants/><portal-core:defineObjects/> <portal-core:stateBase/>

<%-- Lazily load the base path to the current theme, and the current page node object --%>
<portal-core:lazy-set var="themeWebDAVBaseURI" elExpression="wp.themeList.current.metadata['com.ibm.portal.theme.template.ref']"/>
<portal-core:lazy-set var="currentNavNode" elExpression="wp.selectionModel.selected"/>

<%-- Display the page title --%>
<title><c:out value='${wp.title}'/></title>
<meta name="description" content="<c:out value='${wp.description}'/>">
 
<%-- Outputs any HTML contributed to the head section by any JSR286 portlets on the page --%>
<portal-core:portletsHeadMarkupElements method="html" filter="title,description"/>

<%-- Add link for the Portal navigation state to the current page --%>
<c:if test="${param.includeNavStateUrl ne false}">
	<link id="com.ibm.lotus.NavStateUrl" rel="alternate" href="${fn:escapeXml(currentNavNode.urlGeneration.keepNavigationalState)}" />
</c:if>

<%-- Link to the Portal favicon --%>
<c:if test="${param.includeFavicon ne false }">
	<c:set var="faviconUri" value="${param.faviconLocation}"></c:set>
	<c:if test="${empty faviconUri}"><c:set var="faviconUri" value="${themeWebDAVBaseURI}css/images/favicon.ico"></c:set></c:if>
	<link href="<r:url uri="${faviconUri}" keepNavigationalState="false" lateBinding="false" protected="false"/>" rel="shortcut icon" type="image/x-icon" />
</c:if>
