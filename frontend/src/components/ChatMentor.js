import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  BookOpen, 
  Target, 
  MessageCircle,
  Clock,
  Trash2,
  Download
} from 'lucide-react';
import { authService } from '../services/authService';

const ChatMentor = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: `Bonjour ${user?.full_name || 'apprenant'} ! 👋\n\nJe suis votre mentor IA personnel. Je suis ici pour vous aider dans votre parcours d'apprentissage. Vous pouvez me poser des questions sur :\n\n• Vos cours et modules\n• Des conseils d'apprentissage\n• Des clarifications sur des concepts\n• Des recommandations de ressources\n• Votre progression\n\nComment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date()
      }]);
    }
  }, [user?.full_name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get context from recent messages
      const context = messages.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Utilisateur' : 'Mentor'}: ${msg.content}`
      ).join('\n');

      const response = await authService.chatWithMentor(inputMessage, context);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Add to chat history
      setChatHistory(prev => [...prev, { user: userMessage, ai: aiMessage }]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer dans quelques instants ?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: 'ai',
      content: `Bonjour ${user?.full_name || 'apprenant'} ! 👋\n\nJe suis votre mentor IA personnel. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date()
    }]);
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type === 'user' ? 'Vous' : 'Mentor IA'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-mentor-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickQuestions = [
    {
      icon: BookOpen,
      text: "Recommandez-moi des ressources d'apprentissage",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Target,
      text: "Comment améliorer mes performances ?",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Lightbulb,
      text: "Donnez-moi des conseils d'étude",
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      icon: Clock,
      text: "Comment mieux organiser mon temps ?",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mentor IA</h1>
              <p className="text-sm text-gray-600">Votre assistant personnel 24/7</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportChat}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Exporter la conversation"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Vider la conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`chat-message ${message.type}`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-message ai">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Questions rapides :</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => {
                const Icon = question.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question.text)}
                    className="flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-white transition-colors border"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${question.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-700">{question.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 input-field"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="btn-primary"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Appuyez sur Entrée pour envoyer • Le mentor IA est là pour vous aider 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMentor;