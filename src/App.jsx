import { useEffect, useState } from "react";
import ProjectManager from "./components/ProjectManager";
import ProjectViewer from "./components/ProjectViewer";
import Sidebar from "./components/Sidebar";
import Terminal from "./components/Terminal";

function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load projects from backend
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addProject = async (project) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setActiveProject(newProject);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const updateProject = async (id, updates) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updatedProject = await response.json();
      setProjects(projects.map((p) => (p.id === id ? updatedProject : p)));
      if (activeProject?.id === id) {
        setActiveProject(updatedProject);
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects(projects.filter((p) => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(projects.find((p) => p.id !== id) || null);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 100 && newHeight <= window.innerHeight - 100) {
        setTerminalHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + K: Toggle terminal
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowTerminal(!showTerminal);
      }

      // Cmd/Ctrl + 1-9: Switch projects
      if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (projects[index]) {
          setActiveProject(projects[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showTerminal, projects]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        showTerminal={showTerminal}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-15 flex items-center border-b border-gray-700 bg-bg-secondary px-8 shadow-md z-10">
          {sidebarCollapsed && (
            <h1 className="text-2xl font-bold tracking-tight text-white">
              myDash
            </h1>
          )}
          <div className="ml-auto">
            <ProjectManager
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onDeleteProject={deleteProject}
              activeProject={activeProject}
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-hidden relative"
          style={{
            height: showTerminal
              ? `calc(100% - ${terminalHeight}px - 60px)`
              : "calc(100% - 60px)",
          }}
        >
          <ProjectViewer project={activeProject} />
        </div>

        {showTerminal && (
          <>
            <div
              className="h-1 bg-bg-secondary cursor-row-resize relative flex items-center justify-center transition-colors hover:bg-primary"
              onMouseDown={handleMouseDown}
            >
              <div className="w-10 h-0.5 bg-gray-500 rounded transition-all hover:bg-white hover:w-15"></div>
            </div>
            <div
              className="bg-bg-secondary border-t border-gray-700 overflow-hidden"
              style={{ height: `${terminalHeight}px` }}
            >
              <Terminal />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
