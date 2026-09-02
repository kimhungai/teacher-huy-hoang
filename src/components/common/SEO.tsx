import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { updateSEOMetaTags, type SEOProps } from '../../utils/seoUtils';

export const SEO: React.FC<SEOProps> = (props) => {
  const { language } = useLanguage();

  useEffect(() => {
    updateSEOMetaTags({
      ...props,
      lang: props.lang || (language as 'vi' | 'en')
    });
  }, [props.title, props.description, props.keywords, props.image, props.url, props.type, props.lang, props.breadcrumbs, props.schema, language]);

  return null;
};
