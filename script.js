/* DYNAMIC INTERACTION AND PERSISTENCE CONTROLLER */

document.addEventListener('DOMContentLoaded', () => {
  // Tab Switcher Logic
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetTab = document.getElementById(`tab-${tab.dataset.tab}`);
      if (targetTab) targetTab.classList.add('active');
    });
  });

  // Dynamic Array Storage for Repeatable Blocks
  let educationList = [];
  let experienceList = [];
  let projectsList = [];
  let certificationsList = [];

  // DOM Selection for Dynamic Containers
  const educationInputs = document.getElementById('education-inputs');
  const experienceInputs = document.getElementById('experience-inputs');
  const projectsInputs = document.getElementById('projects-inputs');
  const certificationsInputs = document.getElementById('certifications-inputs');

  const resumeEduList = document.getElementById('resume-education-list');
  const resumeExpList = document.getElementById('resume-experience-list');
  const resumeProjList = document.getElementById('resume-projects-list');
  const resumeCertsList = document.getElementById('resume-certifications-list');

  const STORAGE_KEY = 'resume_builder_template_v4';

  // Load Initial Data from DOM inputs (set in index.html) or LocalStorage
  function initializeData() {
    // Purge legacy/stale localstorage caches so the newest template values are displayed immediately
    ['ronit_sinha_resume_data', 'btech_resume_builder_data', 'resume_builder_data_v1', 'resume_builder_data_v2', 'resume_builder_data_v3'].forEach(k => localStorage.removeItem(k));

    if (localStorage.getItem(STORAGE_KEY)) {
      loadFromLocalStorage();
    } else {
      pullDataFromForm();
    }
    renderResume();
  }

  // Read current input values across the entire form and update JS state variables
  function pullDataFromForm() {
    // 1. Personal Information
    window.personalInfo = {
      name: document.getElementById('input-name').value,
      title: document.getElementById('input-title').value,
      email: document.getElementById('input-email').value,
      phone: document.getElementById('input-phone').value,
      location: document.getElementById('input-location').value,
      portfolio: document.getElementById('input-portfolio').value,
      github: document.getElementById('input-github').value,
      linkedin: document.getElementById('input-linkedin').value
    };

    // 2. Technical Skills
    window.skills = {
      languages: document.getElementById('input-skill-languages').value,
      frameworks: document.getElementById('input-skill-frameworks').value,
      tools: document.getElementById('input-skill-tools').value,
      databases: document.getElementById('input-skill-databases').value
    };

    // 3. Achievements & Leadership
    window.extra = {
      achievements: document.getElementById('input-achievements').value,
      leadership: document.getElementById('input-leadership').value
    };

    // 4. Education Blocks
    educationList = [];
    const eduBlocks = document.querySelectorAll('.education-block');
    eduBlocks.forEach(block => {
      educationList.push({
        institution: block.querySelector('.edu-inst').value,
        degree: block.querySelector('.edu-degree').value,
        date: block.querySelector('.edu-date').value,
        gpa: block.querySelector('.edu-gpa').value
      });
    });

    // 5. Experience Blocks
    experienceList = [];
    const expBlocks = document.querySelectorAll('.experience-block');
    expBlocks.forEach(block => {
      experienceList.push({
        company: block.querySelector('.exp-company').value,
        role: block.querySelector('.exp-role').value,
        date: block.querySelector('.exp-date').value,
        location: block.querySelector('.exp-location').value,
        bullets: block.querySelector('.exp-bullets').value
      });
    });

    // 6. Projects Blocks
    projectsList = [];
    const projBlocks = document.querySelectorAll('.project-block');
    projBlocks.forEach(block => {
      projectsList.push({
        title: block.querySelector('.proj-title').value,
        tech: block.querySelector('.proj-tech').value,
        date: block.querySelector('.proj-date').value,
        link: block.querySelector('.proj-link').value,
        bullets: block.querySelector('.proj-bullets').value
      });
    });

    // 7. Certifications Blocks
    certificationsList = [];
    const certBlocks = document.querySelectorAll('.certification-block');
    certBlocks.forEach(block => {
      certificationsList.push({
        name: block.querySelector('.cert-name').value,
        desc: block.querySelector('.cert-desc').value
      });
    });
  }

  // Renders the preview Canvas with the stored JS states
  function renderResume() {
    // Render Contact Info
    const info = window.personalInfo;
    document.getElementById('resume-name').innerText = info.name || 'Your Name';
    document.getElementById('resume-title').innerText = info.title || 'Undergraduate Student';
    
    // Toggle field rendering & handle empty details cleanly
    toggleContactField('resume-email-container', 'resume-email', info.email, `mailto:${info.email}`, info.email);
    toggleContactField('resume-phone-container', 'resume-phone', info.phone, null, info.phone);
    toggleContactField('resume-location-container', 'resume-location', info.location, null, info.location);
    toggleContactField('resume-portfolio-container', 'resume-portfolio', info.portfolio, info.portfolio, cleanUrl(info.portfolio));
    toggleContactField('resume-github-container', 'resume-github', info.github, formatFullUrl(info.github, 'github'), cleanUrl(info.github));
    toggleContactField('resume-linkedin-container', 'resume-linkedin', info.linkedin, formatFullUrl(info.linkedin, 'linkedin'), cleanUrl(info.linkedin));
    
    // Render dynamic visual dot separators
    updateSeparators();

    // Render Skills
    const s = window.skills;
    renderSkillRow('resume-skills-languages-row', 'resume-skills-languages', s.languages);
    renderSkillRow('resume-skills-frameworks-row', 'resume-skills-frameworks', s.frameworks);
    renderSkillRow('resume-skills-tools-row', 'resume-skills-tools', s.tools);
    renderSkillRow('resume-skills-databases-row', 'resume-skills-databases', s.databases);
    
    // Toggle Skills section if completely empty
    const hasAnySkills = s.languages || s.frameworks || s.tools || s.databases;
    document.getElementById('section-skills').style.display = hasAnySkills ? 'block' : 'none';

    // Render Education Section
    resumeEduList.innerHTML = '';
    educationList.forEach(edu => {
      if (!edu.institution && !edu.degree) return;
      const item = document.createElement('div');
      item.className = 'education-item';
      item.innerHTML = `
        <div class="item-header">
          <span class="item-title">${edu.institution || 'Institution'}</span>
          <span class="item-meta">${edu.date || 'Duration'}</span>
        </div>
        <div class="item-header">
          <span class="item-subtitle">${edu.degree || 'Degree'}</span>
          <span class="item-submeta">${edu.gpa ? 'CGPA/Marks: ' + edu.gpa : ''}</span>
        </div>
      `;
      resumeEduList.appendChild(item);
    });

    // Render Experience Section
    const showExp = document.getElementById('toggle-experience-sec').checked;
    const expSection = document.getElementById('section-experience');
    if (showExp && experienceList.length > 0) {
      expSection.style.display = 'block';
      resumeExpList.innerHTML = '';
      experienceList.forEach(exp => {
        if (!exp.company && !exp.role) return;
        const item = document.createElement('div');
        item.className = 'experience-item';
        
        let bulletHtml = '';
        const lines = parseBulletPoints(exp.bullets);
        if (lines.length > 0) {
          bulletHtml = `<ul class="resume-bullets">${lines.map(l => `<li>${l}</li>`).join('')}</ul>`;
        }

        item.innerHTML = `
          <div class="item-header">
            <span class="item-title">${exp.company || 'Company'}</span>
            <span class="item-meta">${exp.date || 'Duration'}</span>
          </div>
          <div class="item-header">
            <span class="item-subtitle">${exp.role || 'Role'}</span>
            <span class="item-submeta">${exp.location || ''}</span>
          </div>
          ${bulletHtml}
        `;
        resumeExpList.appendChild(item);
      });
    } else {
      expSection.style.display = 'none';
    }

    // Render Projects Section
    const showProj = document.getElementById('toggle-projects-sec').checked;
    const projSection = document.getElementById('section-projects');
    if (showProj && projectsList.length > 0) {
      projSection.style.display = 'block';
      resumeProjList.innerHTML = '';
      projectsList.forEach(proj => {
        if (!proj.title) return;
        const item = document.createElement('div');
        item.className = 'project-item';

        let bulletHtml = '';
        const lines = parseBulletPoints(proj.bullets);
        if (lines.length > 0) {
          bulletHtml = `<ul class="resume-bullets">${lines.map(l => `<li>${l}</li>`).join('')}</ul>`;
        }

        const formattedLink = proj.link ? `<span class="dot-separator">|</span> <a href="${formatLinkUrl(proj.link)}" target="_blank" style="color: var(--resume-text-secondary); text-decoration: none; font-weight: normal; font-size: 8.5pt;"><i class="fa-solid fa-link" style="font-size: 8pt;"></i> ${cleanUrl(proj.link)}</a>` : '';

        item.innerHTML = `
          <div class="item-header">
            <span class="item-title">${proj.title} <span style="font-weight: 500; font-size: 9.5pt; color: var(--resume-text-secondary);">(${proj.tech || 'Tech Stack'})</span> ${formattedLink}</span>
            <span class="item-meta">${proj.date || ''}</span>
          </div>
          ${bulletHtml}
        `;
        resumeProjList.appendChild(item);
      });
    } else {
      projSection.style.display = 'none';
    }

    // Render Certifications Section
    const showExtra = document.getElementById('toggle-extra-sec').checked;
    const certSection = document.getElementById('section-certifications');
    if (showExtra && certificationsList.length > 0) {
      certSection.style.display = 'block';
      resumeCertsList.innerHTML = '';
      certificationsList.forEach(cert => {
        if (!cert.name) return;
        const item = document.createElement('div');
        item.className = 'certification-item';
        item.style.marginBottom = '0.35rem';
        item.innerHTML = `
          <div style="font-size: 9.5pt; line-height: 1.35; margin-bottom: 2px;">
            <strong>${cert.name}</strong>
            ${cert.desc ? `<div style="color: var(--resume-text-secondary); font-size: 8.5pt; line-height: 1.3; margin-top: 1px; margin-left: 0.15in;">${cert.desc}</div>` : ''}
          </div>
        `;
        resumeCertsList.appendChild(item);
      });
    } else {
      certSection.style.display = 'none';
    }

    // Render Achievements Section
    const achSection = document.getElementById('section-achievements');
    const resumeAchievementsList = document.getElementById('resume-achievements-list');
    const achLines = parseBulletPoints(window.extra.achievements);
    if (showExtra && achLines.length > 0) {
      achSection.style.display = 'block';
      resumeAchievementsList.innerHTML = achLines.map(l => `<li>${l}</li>`).join('');
    } else {
      achSection.style.display = 'none';
    }

    // Render Leadership Section
    const leadSection = document.getElementById('section-leadership');
    const resumeLeadershipList = document.getElementById('resume-leadership-list');
    const leadLines = parseBulletPoints(window.extra.leadership);
    if (showExtra && leadLines.length > 0) {
      leadSection.style.display = 'block';
      resumeLeadershipList.innerHTML = leadLines.map(l => `<li>${l}</li>`).join('');
    } else {
      leadSection.style.display = 'none';
    }
  }

  // Utility to handle display and toggling of contact fields
  function toggleContactField(containerId, elementId, value, linkHref, textValue) {
    const container = document.getElementById(containerId);
    const element = document.getElementById(elementId);
    
    if (value && value.trim() !== '') {
      container.style.display = 'inline-block';
      if (linkHref) {
        element.setAttribute('href', linkHref);
        element.innerText = textValue;
      } else {
        element.innerText = textValue;
      }
    } else {
      container.style.display = 'none';
    }
  }

  function renderSkillRow(rowId, spanId, value) {
    const row = document.getElementById(rowId);
    const span = document.getElementById(spanId);
    if (value && value.trim() !== '') {
      row.style.display = 'block';
      span.innerText = value;
    } else {
      row.style.display = 'none';
    }
  }

  // Handle dot separation dynamic sizing
  function updateSeparators() {
    const header = document.querySelector('.resume-header');
    const contactInfo = document.querySelector('.resume-contact-info');
    const socialInfo = document.querySelector('.resume-social-info');
    
    adjustSeparators(contactInfo);
    adjustSeparators(socialInfo);
  }

  function adjustSeparators(parentContainer) {
    if (!parentContainer) return;
    const spans = Array.from(parentContainer.children);
    
    // Hide all separators initially
    spans.forEach(s => {
      if (s.classList.contains('dot-separator')) {
        s.style.display = 'none';
      }
    });

    // Determine visible content elements (exclude spacers)
    const visibleElements = spans.filter(s => !s.classList.contains('dot-separator') && s.style.display !== 'none');
    
    // Insert dots between elements
    for (let i = 0; i < visibleElements.length - 1; i++) {
      const targetDot = visibleElements[i].nextElementSibling;
      if (targetDot && targetDot.classList.contains('dot-separator')) {
        targetDot.style.display = 'inline';
      }
    }
  }

  // Clean URL helper for neat display
  function cleanUrl(url) {
    if (!url) return '';
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  }

  // Build full URLs for Github & Linkedin if username is provided
  function formatFullUrl(input, platform) {
    if (!input) return '';
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }
    if (platform === 'github') {
      return `https://github.com/${input.replace(/^github\.com\//, '')}`;
    }
    if (platform === 'linkedin') {
      return `https://linkedin.com/in/${input.replace(/^linkedin\.com\/in\//, '')}`;
    }
    return `https://${input}`;
  }

  // Clean generic link URLs
  function formatLinkUrl(url) {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  }

  // Bullet points text parser
  function parseBulletPoints(text) {
    if (!text) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Clean leading bullet chars if they exist
        return line.replace(/^[\s\-*••]+/, '');
      });
  }

  // LOCAL STORAGE AUTO-SAVE AND SYNC
  function saveToLocalStorage() {
    pullDataFromForm();
    const data = {
      personalInfo: window.personalInfo,
      skills: window.skills,
      extra: window.extra,
      educationList,
      experienceList,
      projectsList,
      certificationsList,
      theme: document.body.className,
      font: document.getElementById('font-family-select').value,
      showExp: document.getElementById('toggle-experience-sec').checked,
      showProj: document.getElementById('toggle-projects-sec').checked,
      showExtra: document.getElementById('toggle-extra-sec').checked
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return;

      // Personal
      document.getElementById('input-name').value = saved.personalInfo.name || '';
      document.getElementById('input-title').value = saved.personalInfo.title || '';
      document.getElementById('input-email').value = saved.personalInfo.email || '';
      document.getElementById('input-phone').value = saved.personalInfo.phone || '';
      document.getElementById('input-location').value = saved.personalInfo.location || '';
      document.getElementById('input-portfolio').value = saved.personalInfo.portfolio || '';
      document.getElementById('input-github').value = saved.personalInfo.github || '';
      document.getElementById('input-linkedin').value = saved.personalInfo.linkedin || '';

      // Skills
      document.getElementById('input-skill-languages').value = saved.skills.languages || '';
      document.getElementById('input-skill-frameworks').value = saved.skills.frameworks || '';
      document.getElementById('input-skill-tools').value = saved.skills.tools || '';
      document.getElementById('input-skill-databases').value = saved.skills.databases || '';

      // Extra
      document.getElementById('input-achievements').value = saved.extra.achievements || '';
      document.getElementById('input-leadership').value = saved.extra.leadership || '';

      // Toggles
      document.getElementById('toggle-experience-sec').checked = saved.showExp !== false;
      document.getElementById('toggle-projects-sec').checked = saved.showProj !== false;
      document.getElementById('toggle-extra-sec').checked = saved.showExtra !== false;

      // Dynamic Education Blocks
      educationList = saved.educationList || [];
      renderEducationInputs();

      // Dynamic Experience Blocks
      experienceList = saved.experienceList || [];
      renderExperienceInputs();

      // Dynamic Projects Blocks
      projectsList = saved.projectsList || [];
      renderProjectsInputs();

      // Dynamic Certifications Blocks
      certificationsList = saved.certificationsList || [];
      renderCertificationsInputs();

      // Theme UI Restores
      if (saved.theme) {
        document.body.className = saved.theme;
        const activeSwatch = document.querySelector(`.color-swatch[data-theme="${saved.theme}"]`);
        if (activeSwatch) {
          document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          activeSwatch.classList.add('active');
        }
      }

      // Font Restores
      if (saved.font) {
        const select = document.getElementById('font-family-select');
        select.value = saved.font;
        changeFontFamily(saved.font);
      }

      pullDataFromForm();
    } catch (e) {
      console.error("Error loading resume cache from localStorage:", e);
    }
  }

  // RENDER DYNAMIC FORM INPUTS (so input forms match loaded array list states)
  function renderEducationInputs() {
    educationInputs.innerHTML = '';
    educationList.forEach((edu, idx) => {
      const block = document.createElement('div');
      block.className = 'education-block form-card';
      block.dataset.index = idx;
      block.innerHTML = `
        <div class="card-header">
          <h3>Education / Degree #${idx + 1}</h3>
          ${idx > 0 ? `<button class="delete-btn" onclick="removeEducation(${idx})"><i class="fa-solid fa-trash-can"></i></button>` : ''}
        </div>
        <div class="form-group">
          <label>Institution Name</label>
          <input type="text" class="edu-inst" placeholder="University / College Name" value="${edu.institution || ''}">
        </div>
        <div class="form-group">
          <label>Degree & Major</label>
          <input type="text" class="edu-degree" placeholder="Degree Name / Major" value="${edu.degree || ''}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Graduation Year/Period</label>
            <input type="text" class="edu-date" placeholder="YYYY - YYYY" value="${edu.date || ''}">
          </div>
          <div class="form-group">
            <label>GPA / CGPA / Marks</label>
            <input type="text" class="edu-gpa" placeholder="0.0 / 10.0" value="${edu.gpa || ''}">
          </div>
        </div>
      `;
      educationInputs.appendChild(block);
    });
    bindDynamicEvents();
  }

  function renderExperienceInputs() {
    experienceInputs.innerHTML = '';
    experienceList.forEach((exp, idx) => {
      const block = document.createElement('div');
      block.className = 'experience-block form-card';
      block.dataset.index = idx;
      block.innerHTML = `
        <div class="card-header">
          <h3>Experience #${idx + 1}</h3>
          <button class="delete-btn" onclick="removeExperience(${idx})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Company / Organization</label>
            <input type="text" class="exp-company" placeholder="Company / Organization Name" value="${exp.company || ''}">
          </div>
          <div class="form-group">
            <label>Job Title / Role</label>
            <input type="text" class="exp-role" placeholder="Job Title / Role" value="${exp.role || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Duration / Dates</label>
            <input type="text" class="exp-date" placeholder="Month YYYY - Month YYYY" value="${exp.date || ''}">
          </div>
          <div class="form-group">
            <label>Location</label>
            <input type="text" class="exp-location" placeholder="City, Country / Remote" value="${exp.location || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Bullet Points (one per line)</label>
          <textarea class="exp-bullets" rows="4" placeholder="- Describe key responsibilities and measurable impact...">${exp.bullets || ''}</textarea>
        </div>
      `;
      experienceInputs.appendChild(block);
    });
    bindDynamicEvents();
  }

  function renderProjectsInputs() {
    projectsInputs.innerHTML = '';
    projectsList.forEach((proj, idx) => {
      const block = document.createElement('div');
      block.className = 'project-block form-card';
      block.dataset.index = idx;
      block.innerHTML = `
        <div class="card-header">
          <h3>Project #${idx + 1}</h3>
          <button class="delete-btn" onclick="removeProject(${idx})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Project Title</label>
            <input type="text" class="proj-title" placeholder="Project Title" value="${proj.title || ''}">
          </div>
          <div class="form-group">
            <label>Technologies Used</label>
            <input type="text" class="proj-tech" placeholder="Tech 1, Tech 2, Tech 3, Tech 4" value="${proj.tech || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Timeline / Date</label>
            <input type="text" class="proj-date" placeholder="Month YYYY - Month YYYY" value="${proj.date || ''}">
          </div>
          <div class="form-group">
            <label>Project Link / Repository</label>
            <input type="text" class="proj-link" placeholder="https://github.com/yourusername/project-repo" value="${proj.link || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Bullet Points (one per line)</label>
          <textarea class="proj-bullets" rows="4" placeholder="- Describe problem solved and core engineering...">${proj.bullets || ''}</textarea>
        </div>
      `;
      projectsInputs.appendChild(block);
    });
    bindDynamicEvents();
  }

  // EXPOSE ARRAY MANIPULATION GLOBALLY (for direct onclick triggers in raw html)
  window.removeEducation = function(index) {
    educationList.splice(index, 1);
    renderEducationInputs();
    saveToLocalStorage();
    renderResume();
  };

  window.removeExperience = function(index) {
    experienceList.splice(index, 1);
    renderExperienceInputs();
    saveToLocalStorage();
    renderResume();
  };

  window.removeProject = function(index) {
    projectsList.splice(index, 1);
    renderProjectsInputs();
    saveToLocalStorage();
    renderResume();
  };

  window.removeCertification = function(index) {
    certificationsList.splice(index, 1);
    renderCertificationsInputs();
    saveToLocalStorage();
    renderResume();
  };

  // ADD SECTION BUTTON HANDLERS
  document.getElementById('add-education-btn').addEventListener('click', () => {
    pullDataFromForm();
    educationList.push({ institution: '', degree: '', date: '', gpa: '' });
    renderEducationInputs();
    saveToLocalStorage();
    renderResume();
  });

  document.getElementById('add-experience-btn').addEventListener('click', () => {
    pullDataFromForm();
    experienceList.push({ company: '', role: '', date: '', location: '', bullets: '' });
    renderExperienceInputs();
    saveToLocalStorage();
    renderResume();
  });

  document.getElementById('add-project-btn').addEventListener('click', () => {
    pullDataFromForm();
    projectsList.push({ title: '', tech: '', date: '', link: '', bullets: '' });
    renderProjectsInputs();
    saveToLocalStorage();
    renderResume();
  });

  document.getElementById('add-certification-btn').addEventListener('click', () => {
    pullDataFromForm();
    certificationsList.push({ name: '', desc: '' });
    renderCertificationsInputs();
    saveToLocalStorage();
    renderResume();
  });

  // BIND KEYUPS AND TOGGLES DYNAMICALLY
  function bindDynamicEvents() {
    const inputs = document.querySelectorAll('.customizer-content input, .customizer-content textarea, .customizer-content select');
    inputs.forEach(input => {
      // Remove any existing listener to prevent duplicate firings
      input.removeEventListener('input', inputChangeHandler);
      input.addEventListener('input', inputChangeHandler);
    });
  }

  function inputChangeHandler() {
    pullDataFromForm();
    renderResume();
    saveToLocalStorage();
  }

  // ACCENT THEME & TYPOGRAPHY SELECTORS
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      
      const themeClass = swatch.dataset.theme;
      document.body.className = themeClass;
      saveToLocalStorage();
      renderResume();
    });
  });

  const fontSelect = document.getElementById('font-family-select');
  fontSelect.addEventListener('change', (e) => {
    changeFontFamily(e.target.value);
    saveToLocalStorage();
  });

  function changeFontFamily(fontClass) {
    const canvas = document.getElementById('resume-canvas');
    canvas.className = 'resume-sheet ' + fontClass;
  }

  // Action Buttons: Print PDF & Reset Settings
  document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
  });

  // Dynamic Title Blanking during print to prevent title showing up in Chrome header
  window.addEventListener('beforeprint', () => {
    window.originalTitle = document.title;
    document.title = '';
  });

  window.addEventListener('afterprint', () => {
    document.title = window.originalTitle;
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to restore default template details? This will overwrite your current progress.")) {
      ['ronit_sinha_resume_data', 'btech_resume_builder_data', 'resume_builder_data_v1', 'resume_builder_data_v2', 'resume_builder_data_v3', STORAGE_KEY].forEach(k => localStorage.removeItem(k));
      location.reload();
    }
  });

  // Toggle Visibility elements
  document.getElementById('toggle-experience-sec').addEventListener('change', () => {
    renderResume();
    saveToLocalStorage();
  });

  document.getElementById('toggle-projects-sec').addEventListener('change', () => {
    renderResume();
    saveToLocalStorage();
  });

  document.getElementById('toggle-extra-sec').addEventListener('change', () => {
    renderResume();
    saveToLocalStorage();
  });

  function renderCertificationsInputs() {
    certificationsInputs.innerHTML = '';
    certificationsList.forEach((cert, idx) => {
      const block = document.createElement('div');
      block.className = 'certification-block form-card';
      block.dataset.index = idx;
      block.innerHTML = `
        <div class="card-header">
          <h3>Certification #${idx + 1}</h3>
          <button class="delete-btn" onclick="removeCertification(${idx})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div class="form-group">
          <label>Certificate Name</label>
          <input type="text" class="cert-name" placeholder="Certification Name" value="${cert.name || ''}">
        </div>
        <div class="form-group">
          <label>Description / Authority</label>
          <input type="text" class="cert-desc" placeholder="Issuing Organization / Authority • Description of skills validated." value="${cert.desc || ''}">
        </div>
      `;
      certificationsInputs.appendChild(block);
    });
    bindDynamicEvents();
  }

  // RUN INITIALIZER
  initializeData();
  bindDynamicEvents();
});
