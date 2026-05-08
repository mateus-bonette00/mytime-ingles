import './Testimonials.css';
import Icon from '../shared/Icon';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Ana Carolina Silva',
      role: 'Estudante',
      rating: 5,
      text: 'Os áudios da Teacher Ediane me ajudaram muito na minha viagem para Orlando. Consegui me comunicar em todas as situações do dia a dia com muita confiança!',
    },
    {
      id: 2,
      name: 'Roberto Mendes',
      role: 'Empresário',
      text: 'Excelente material! As 25 frases são realmente essenciais. A pronúncia clara e didática faz toda a diferença no aprendizado. Recomendo muito!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Mariana Costa',
      role: 'Professora',
      text: 'Material muito bem estruturado. As legendas sincronizadas facilitam demais o aprendizado. Meus alunos também estão adorando!',
      rating: 5,
    },
    {
      id: 4,
      name: 'Felipe Santos',
      role: 'Engenheiro',
      text: 'Investimento que valeu muito a pena! Em poucos dias já estava usando as frases no meu trabalho. A Teacher Ediane ensina de forma clara e objetiva.',
      rating: 5,
    },
    {
      id: 5,
      name: 'Juliana Oliveira',
      role: 'Designer',
      text: 'Adorei o curso! Super prático e direto ao ponto. Os áudios nativos me ajudaram a melhorar muito minha pronúncia. Indico para todos!',
      rating: 5,
    },
    {
      id: 6,
      name: 'Carlos Eduardo',
      role: 'Médico',
      text: 'Finalmente um curso focado no que realmente importa para viagens. A Teacher Ediane sabe exatamente o que ensinar. Material excepcional!',
      rating: 5,
    },
  ];

  return (
    <section className="testimonials" id="avaliacoes">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="section-title">
            O que nossos alunos dizem
          </h2>
          <p className="section-subtitle">
            Veja os resultados de quem já está falando inglês com confiança
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <Icon key={index} name="star" size={20} color="#f59e0b" />
                ))}
              </div>

              <p className="testimonial-text">{testimonial.text}</p>

              <div className="testimonial-author">
                <div className="author-avatar">
                  <span>{testimonial.name.charAt(0)}</span>
                </div>
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
