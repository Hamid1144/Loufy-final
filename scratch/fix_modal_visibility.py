import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

bad_open = "dsModal.style.display = 'flex';"
good_open = "dsModal.classList.add('active');"
content = content.replace(bad_open, good_open)

bad_close1 = "dsModal.style.display = 'none'"
good_close1 = "dsModal.classList.remove('active')"
content = content.replace(bad_close1, good_close1)

# Ensure the modal HTML style doesn't have inline display:none, or if it does, it's fine as long as .active overrides it,
# but it's better to remove it.
old_modal_decl = '<div id="dashboard-subcat-modal" class="modal-overlay" style="display:none; z-index:999999;">'
new_modal_decl = '<div id="dashboard-subcat-modal" class="modal-overlay" style="z-index:999999;">'
content = content.replace(old_modal_decl, new_modal_decl)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed modal visibility in admin.html")
