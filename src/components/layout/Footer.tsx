const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} SmartSales365. Todos los derechos reservados.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-primary">Política de Privacidad</a>
          <span>|</span>
          <a href="#" className="hover:text-primary">Términos de Servicio</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
