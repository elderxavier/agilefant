<%@ include file="../inc/_taglibs.jsp"%>

<struct:htmlWrapper navi="settings">

<jsp:attribute name="menuContent">
  <struct:settingsMenu />
</jsp:attribute>

<jsp:body>

<script type="text/javascript">
$(document).ready(function() {
  var controller = new UserListController({
    enabledElement: $('#userListElement')
  });
});
</script>

<div id="userListElement" style="min-width: 750px"> </div>

</jsp:body>
</struct:htmlWrapper>
