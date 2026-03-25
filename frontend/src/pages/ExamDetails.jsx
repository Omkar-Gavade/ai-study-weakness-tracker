import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  UserCheck,
  CheckCircle,
  FileText,
  Shield,
  Building2,
  Home,
  Rocket,
  ChevronRight,
  Crown,
  Award,
  FileCheck,
  Info,
  ChevronDown,
  Layout
} from 'lucide-react';

// Reusable: <ExamDetails exam="mpsc" subGroup="group-a" />
// Route-driven: <ExamDetails /> (reads from URL params)
const ExamDetails = ({ exam: examProp, subGroup: subGroupProp } = {}) => {
  const { examId: examParamId, subGroupId: subGroupParamId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('syllabus');

  // Props take priority over URL params — enables reusable usage
  const examId = (examProp || examParamId || 'mpsc').toLowerCase();
  const subGroupId = subGroupProp || subGroupParamId;

  const examData = {
    mpsc: {
      name: 'MPSC (राज्य सेवा)',
      icon: <UserCheck size={48} />,
      subGroups: [
        {
          id: 'group-a',
          name: 'गट अ (Group A)',
          description: 'राज्य शासनातील उच्च पदांसाठी (Deputy Collector, DSP, इ.) परीक्षा.',
          icon: <Crown size={32} />,
          color: '#fbbf24'
        },
        {
          id: 'group-b',
          name: 'गट ब (Group B)',
          description: 'राज्य शासनातील मध्यम स्तरावरील पदांसाठी परीक्षा (PSI, STI, ASO).',
          icon: <Award size={32} />,
          color: '#6366f1'
        },
        {
          id: 'group-c',
          name: 'गट क (Group C)',
          description: 'कनिष्ठ स्तरावरील सरकारी पदांसाठी परीक्षा (Tax Assistant, Clerk Typist).',
          icon: <FileCheck size={32} />,
          color: '#10b981'
        }
      ],
      details: {
        'group-a': {
          name: 'गट अ (राज्य सेवा पूर्व व मुख्य)',
          syllabus: {
            sections: [
              {
                title: 'Paper 1 (General Studies)',
                items: [
                  'चालू घडामोडी (Current Affairs)',
                  'भारत आणि महाराष्ट्राचा इतिहास',
                  'भारत आणि महाराष्ट्राचा भूगोल',
                  'भारतीय राज्यशास्त्र आणि शासन (Polity)',
                  'आर्थिक आणि सामाजिक विकास (Economy)',
                  'पर्यावरण आणि जैवविविधता',
                  'सामान्य विज्ञान'
                ]
              },
              {
                title: 'Paper 2 (CSAT)',
                items: [
                  'आकलन (Comprehension)',
                  'तार्किक विचार आणि विश्लेषणात्मक क्षमता',
                  'निर्णय क्षमता आणि समस्या निवारण',
                  'सामान्य मानसिक क्षमता (Mental Ability)',
                  'बेसिक मॅथ्स (इयत्ता १०वी स्तर)'
                ]
              }
            ]
          },
          eligibility: {
            age: '१९ ते ३८ वर्षे (खुला प्रवर्ग)',
            education: 'मान्यताप्राप्त विद्यापीठाची पदवी (Any Graduation)'
          },
          guidelines: [
            'प्रत्येक पेपर २०० गुणांचा असतो.',
            'कालावधी: प्रत्येक पेपरसाठी २ तास.',
            'चुकीच्या उत्तरासाठी निगेटिव्ह मार्किंग लागू.',
            'परीक्षा पूर्णपणे MCQ आधारित असते.',
            'पूर्व परीक्षेत उत्तीर्ण होणे मुख्य परीक्षेसाठी अनिवार्य आहे.'
          ]
        },
        'group-b': {
          name: 'गट ब (PSI, STI, ASO)',
          syllabus: {
            sections: [
              {
                title: 'संयुक्त पूर्व परीक्षा विषय',
                items: [
                  'इतिहास (भारत व महाराष्ट्र)',
                  'भूगोल (महाराष्ट्राच्या विशेष संदर्भासह)',
                  'अर्थव्यवस्था (भारतीय अर्थव्यवस्था व शासकीय अर्थव्यवस्था)',
                  'चालू घडामोडी',
                  'सामान्य विज्ञान (भौतिकशास्त्र, रसायनशास्त्र, जीवशास्त्र)',
                  'अंकगणित (Basic Arithmetic)',
                  'बुद्धिमत्ता चाचणी (Reasoning)'
                ]
              }
            ]
          },
          eligibility: {
            age: '१९ ते ३८ वर्षे (प्रवर्गानुसार सवलत)',
            education: 'कोणत्याही शाखेतील पदवी (Degree)'
          },
          guidelines: [
            'संयुक्त पूर्व परीक्षा - एकूण १०० प्रश्न.',
            'एकूण गुण - १००.',
            'कालावधी - १ तास.',
            'निगेटिव्ह मार्किंग लागू.',
            'शारीरिक चाचणी केवळ PSI पदासाठी आवश्यक.'
          ]
        },
        'group-c': {
          name: 'गट क (Tax Asst, Clerk)',
          syllabus: {
            sections: [
              {
                title: 'संयुक्त पूर्व परीक्षा विषय',
                items: [
                  'इतिहास आणि भूगोल',
                  'भारतीय अर्थव्यवस्था',
                  'चालू घडामोडी',
                  'सामान्य विज्ञान',
                  'अंकगणित व बुद्धिमत्ता',
                  'मराठी आणि इंग्रजी व्याकरण (मुख्य परीक्षेसाठी)'
                ]
              }
            ]
          },
          eligibility: {
            age: '१९ ते ३८ वर्षे',
            education: 'पदवी + संबंधित कौशल्य (उदा. टायपिंग प्रमाणपत्र)'
          },
          guidelines: [
            'एकूण १०० प्रश्न - १०० गुण.',
            'वेळ: ६० मिनिटे (१ तास).',
            'चुकीच्या उत्तरासाठी गुण कापले जातात.',
            'कौशल्य चाचणी (Skill Test) काही पदांसाठी अनिवार्य.'
          ]
        }
      }
    },
    police: {
      name: 'पोलीस भरती (Police Bharti)',
      icon: <Shield size={48} />,
      syllabus: {
        sections: [
          {
            title: 'लेखी परीक्षा अभ्यासक्रम',
            items: [
              'अंकगणित (Arithmetics)',
              'सामान्य ज्ञान आणि चालू घडामोडी',
              'बुद्धिमत्ता चाचणी',
              'मराठी व्याकरण'
            ]
          }
        ]
      },
      eligibility: {
        age: '१८ ते २८ वर्षे (प्रवर्गानुसार सवलत)',
        education: 'इयत्ता १२ वी उत्तीर्ण (HSC)'
      },
      guidelines: [
        'लेखी परीक्षा १०० गुणांची असते.',
        'शारीरिक चाचणी ५० गुणांची असते.',
        'उंची आणि छातीची मोजमापे नियमानुसार असणे आवश्यक.'
      ]
    },
    talathi: {
      name: 'तलाठी भरती (Talathi)',
      icon: <FileText size={48} />,
      syllabus: {
        sections: [
          {
            title: 'TCS/IBPS पॅटर्न अभ्यासक्रम',
            items: [
              'मराठी व्याकरण',
              'इंग्रजी व्याकरण',
              'सामान्य ज्ञान',
              'अंकगणित व बुद्धिमत्ता'
            ]
          }
        ]
      },
      eligibility: {
        age: '१८ ते ३८ वर्षे',
        education: 'कोणत्याही शाखेतील पदवी + MSCIT प्रमाणपत्र'
      },
      guidelines: [
        'एकूण २०० गुणांची ऑनलाईन परीक्षा.',
        'नेगेटिव्ह मार्किंग नसते.',
        'वेळ २ तास.'
      ]
    },
    zp: {
      name: 'ZP भरती',
      icon: <Building2 size={48} />,
      syllabus: {
        sections: [
          {
            title: 'पदाशी संबंधित तांत्रिक व अतांत्रिक विषय',
            items: [
              'तांत्रिक ज्ञान (उदा. आरोग्य, कृषी)',
              'मराठी व इंग्रजी व्याकरण',
              'सामान्य ज्ञान',
              'गणित व बुद्धिमत्ता'
            ]
          }
        ]
      },
      eligibility: {
        age: '१८ ते ४० वर्षे',
        education: '१०वी/१२वी/पदवी किंवा डिप्लोमा (पदाप्रमाणे)'
      },
      guidelines: [
        'ऑनलाईन पदभरती परीक्षा.',
        'विभागामार्फत जाहिरात प्रसिद्ध केली जाते.'
      ]
    },
    mhada: {
      name: 'Mhada / इतर परीक्षा',
      icon: <Home size={48} />,
      syllabus: {
        sections: [
          {
            title: 'सामान्य अभ्यासक्रम',
            items: [
              'मराठी व इंग्रजी भाषा ज्ञान',
              'बौद्धिक चाचणी',
              'सामान्य ज्ञान'
            ]
          }
        ]
      },
      eligibility: {
        age: '१८ ते ३८ वर्षे',
        education: 'पदवी किंवा तांत्रिक पदविका (Diploma)'
      },
      guidelines: [
        'मल्टिपल चॉइस क्वेश्चन्स (MCQ).',
        'CBT आधारित परीक्षा.'
      ]
    }
  };

  const currentExam = examData[examId] || examData.mpsc;
  const isMpscWithSubGroups = examId === 'mpsc' && !subGroupId;
  const currentDetails = subGroupId ? currentExam.details[subGroupId] : currentExam;

  // Render Syllabus Content
  const renderSyllabus = () => {
    const syllabus = currentDetails.syllabus;
    if (!syllabus || !syllabus.sections) return <p>माहिती उपलब्ध नाही.</p>;
    
    return (
      <div className="tab-content-area">
        {syllabus.sections.map((section, sidx) => (
          <div key={sidx} className="syllabus-section" style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
              {section.title}
            </h4>
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {section.items.map((item, idx) => (
                <div key={idx} className="syllabus-pill">
                  <BookOpen size={16} /> {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Eligibility Content
  const renderEligibility = () => (
    <div className="tab-content-area" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div className="info-card" style={{ flex: 1, minWidth: '300px' }}>
        <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '1rem' }}>
          <UserCheck size={24} />
        </div>
        <h3>वयोमर्यादा (Age Limit)</h3>
        <p style={{ color: 'var(--text-muted)' }}>{currentDetails.eligibility.age}</p>
      </div>
      <div className="info-card" style={{ flex: 1, minWidth: '300px' }}>
        <div className="stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', marginBottom: '1rem' }}>
          <Info size={24} />
        </div>
        <h3>शैक्षणिक पात्रता (Education)</h3>
        <p style={{ color: 'var(--text-muted)' }}>{currentDetails.eligibility.education}</p>
      </div>
    </div>
  );

  // Render Guidelines Content
  const renderGuidelines = () => (
    <div className="tab-content-area">
      <div className="guidelines-list">
        {currentDetails.guidelines.map((guide, idx) => (
          <div key={idx} className="guide-item">
            <CheckCircle size={20} className="text-warning" />
            <span>{guide}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="exam-details-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumb">
        <Link to="/dashboard">डॅशबोर्ड</Link>
        <ChevronRight size={14} />
        {subGroupId ? (
          <>
            <Link to={`/exam/${examId}`}>{currentExam.name}</Link>
            <ChevronRight size={14} />
            <span className="current">{currentDetails.name}</span>
          </>
        ) : (
          <span className="current">{currentExam.name}</span>
        )}
      </nav>

      <button 
        onClick={() => navigate(subGroupId ? `/exam/${examId}` : '/dashboard')} 
        className="nav-link-btn"
      >
        <ArrowLeft size={18} /> {subGroupId ? `${currentExam.name} वर परत जा` : 'डॅशबोर्डकडे परत जा'}
      </button>

      {/* Header Panel */}
      <div className="panel header-panel">
        <div className="header-icon-container" style={{ color: isMpscWithSubGroups ? 'var(--primary)' : (subGroupId ? currentExam.subGroups.find(g => g.id === subGroupId).color : 'var(--primary)') }}>
          {subGroupId ? currentExam.subGroups.find(g => g.id === subGroupId).icon : currentExam.icon}
        </div>
        <h1>{subGroupId ? currentDetails.name : currentExam.name}</h1>
        <p>परीक्षेची संपूर्ण माहिती आणि सराव</p>
      </div>

      {isMpscWithSubGroups ? (
        <div className="dashboard-grid">
          {currentExam.subGroups.map((group) => (
            <Link key={group.id} to={`/exam/${examId}/${group.id}`} className="stat-card selection-card">
              <div className="stat-icon" style={{ background: `${group.color}20`, color: group.color }}>
                {group.icon}
              </div>
              <div className="stat-info">
                <h3>{group.name}</h3>
                <p>{group.description}</p>
              </div>
              <ChevronRight size={24} className="chevron" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="details-card-container">
          {/* Tabs Navigation */}
          <div className="tabs-nav">
            <button 
              className={`tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              <BookOpen size={20} /> अभ्यासक्रम (Syllabus)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'eligibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('eligibility')}
            >
              <UserCheck size={20} /> पात्रता (Eligibility)
            </button>
            <button 
              className={`tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
              onClick={() => setActiveTab('guidelines')}
            >
              <CheckCircle size={20} /> मार्गदर्शक सूचना
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="panel tab-panel">
            {activeTab === 'syllabus' && renderSyllabus()}
            {activeTab === 'eligibility' && renderEligibility()}
            {activeTab === 'guidelines' && renderGuidelines()}
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/quizzes')} 
              className="btn btn-primary start-btn"
            >
              चाचणी सुरू करा (Start Test) <Rocket size={22} />
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .exam-details-container { padding-bottom: 4rem; }
        .breadcrumb { display: flex; alignItems: center; gap: 0.5rem; margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem; }
        .breadcrumb a { color: var(--text-muted); text-decoration: none; }
        .breadcrumb .current { color: var(--primary); font-weight: 500; }
        .nav-link-btn { background: none; border: none; font-size: 1rem; margin-bottom: 2rem; padding: 0; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: color 0.2s; }
        .nav-link-btn:hover { color: var(--text-active); }
        
        .header-panel { text-align: center; padding: 3rem; margin-bottom: 2.5rem; background: linear-gradient(to bottom, rgba(255,255,255,0.02), transparent); }
        .header-icon-container { width: 6rem; height: 6rem; margin: 0 auto 1.5rem; border-radius: 1.5rem; background: var(--border); display: flex; align-items: center; justify-content: center; }
        
        .selection-card { text-decoration: none; cursor: pointer; padding: 2rem; display: flex; align-items: center; gap: 1.5rem; }
        .selection-card .stat-info h3 { font-size: 1.4rem; color: var(--text-active); text-transform: none; margin-bottom: 0.5rem; }
        .selection-card .stat-info p { margin: 0; font-size: 0.95rem; line-height: 1.4; }
        .selection-card .chevron { color: var(--text-muted); margin-left: auto; }

        .tabs-nav { display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; overflow-x: auto; }
        .tab-btn { background: none; border: none; padding: 1rem 1.5rem; color: var(--text-muted); font-size: 1.1rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; border-radius: 0.75rem; transition: all 0.3s; white-space: nowrap; }
        .tab-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-active); }
        .tab-btn.active { background: var(--primary-bg); color: var(--primary); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
        
        .tab-panel { min-height: 400px; padding: 2.5rem; border-radius: 0 0 1.25rem 1.25rem; }
        .tab-content-area { animation: fadeIn 0.4s ease; }
        
        .syllabus-pill { background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 1rem; border-radius: 1rem; display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); transition: all 0.3s; }
        .syllabus-pill:hover { background: rgba(255,255,255,0.06); transform: translateX(5px); color: var(--text-active); }
        
        .info-card { background: rgba(0,0,0,0.2); padding: 2rem; border-radius: 1.25rem; border: 1px solid var(--border); }
        .info-card h3 { font-size: 1.25rem; margin-bottom: 1rem; color: var(--text-active); }
        
        .guide-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: rgba(255,255,255,0.02); border-radius: 1rem; margin-bottom: 1rem; color: var(--text-muted); line-height: 1.6; }
        
        .start-btn { padding: 1.25rem 4rem; font-size: 1.25rem; margin: 0 auto; width: auto; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default ExamDetails;
