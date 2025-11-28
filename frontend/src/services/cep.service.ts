interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

class CEPService {
  async buscarCEP(cep: string): Promise<ViaCEPResponse | null> {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return data;
    } catch (error) {
      throw new Error('Erro ao buscar CEP');
    }
  }
}

export const cepService = new CEPService();
