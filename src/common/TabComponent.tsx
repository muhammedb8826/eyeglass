interface Tab {
    id: string;
    label: string;
    disabled?: boolean;
  }
  
  interface TabsProps {
    tabs: Tab[];
    activeTabId: string;
    onTabChange: (id: string) => void;
  }
  
  const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange }) => {
    const handleTabClick = (id: string) => {
      if (!tabs.find(tab => tab.id === id)?.disabled) {
        onTabChange(id);
      }
    };
  
    return (
      <div>
        <div className="text-sm font-medium text-center text-black dark:text-white bg-white border-b border-stroke dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-wrap -mb-px">
            {tabs.map((tab) => (
              <li key={tab.id} className="me-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(tab.id);
                  }}
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTabId === tab.id
                      ? 'border-primary text-primary dark:border-primary dark:text-primary'
                      : 'border-transparent hover:text-primary dark:hover:text-primary'
                  } ${tab.disabled ? 'text-gray-400 cursor-not-allowed dark:text-gray-500' : ''}`}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  export default Tabs;