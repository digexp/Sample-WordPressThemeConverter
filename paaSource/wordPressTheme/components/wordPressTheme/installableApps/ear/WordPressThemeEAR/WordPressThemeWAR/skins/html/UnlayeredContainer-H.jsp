<%--
Copyright 2014  IBM Corp. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
--%>
<%@ page session="false" buffer="none" %>
<%-- --%>
<%--

	NOTE: By default, automatic reloading of theme and skin JSP files is turned off.
          To see the changes you make to this file without stopping and restarting
          the server, follow the instructions for enabling automatic JSP reloading
          in the InfoCenter.
          
          Do not enable automatic JSP reloading in a production environment
          because performance will decrease.

--%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ include file="./includePortalTaglibs.jspf" %>

<c:set var="layoutNodeId" value="${wp.identification[requestScope['currentLayoutNode']]}"/>

<table class="layoutRow ibmDndRow component-container ${not empty layoutNodeId ? 'id-' : ''}${layoutNodeId}${not empty layoutNodeId ? ' layoutNode' : ''}" cellpadding="0" cellspacing="0" role="presentation">
	<tr>
<%
    boolean hasChildren = false;
%>
        <portal-skin:layoutNodeLoop var="currentLayoutNode">
            <%
              hasChildren = true;
              String columnWidth = (String)currentLayoutNode.getMetrics().getValue(com.ibm.portal.content.CompositionMetrics.WIDTH);
            %>

		<td valign="top" <% if (columnWidth != null){
								out.print ("width=\"");
								out.print (columnWidth);
								out.print ("\"");
							} %>>
            <portal-skin:layoutNodeRender/>
		</td>

        </portal-skin:layoutNodeLoop>
        <%                                                                                                                        
        if (!hasChildren) {%>
            <td width="100%">&nbsp;</td>
        <%}%>
	</tr>
</table>