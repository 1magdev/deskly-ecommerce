package com.app.deskly.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.app.deskly.dto.product.ProductCreateDTO;
import com.app.deskly.dto.product.ProductResponseDTO;
import com.app.deskly.model.Product;
import com.app.deskly.model.Stock;
import com.app.deskly.repository.ProductRepository;
import com.app.deskly.repository.StockRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    // *** Catalog ***

    public List<ProductResponseDTO> listCatalogProducts(String search, String category, int page, int size) {
        List<Product> products = productRepository.findByActive(true);

        return products.stream().map(product -> {
            Stock stock = stockRepository.findByProductId(product.getId()).orElse(null);
            Integer quantity = stock != null ? stock.getQuantity() : 0;

            return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                quantity,
                product.getPrice(),
                product.getActive(),
                product.getDescription(),
                product.getRating(),
                product.getProductImage()
            );
        }).toList();
    }

    public ProductResponseDTO getForCatalogById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        Stock productOnStock = stockRepository.findByProductId(product.getId()).orElse(null);
        Integer quantity = productOnStock != null ? productOnStock.getQuantity() : 0;

        return new ProductResponseDTO(
          product.getId(),
          product.getName(),
          quantity,
          product.getPrice(),
          product.getActive(),
          product.getDescription(),
          product.getRating(),
          product.getProductImage()
        );
    }


    // *** Back-office *** 

    public Page<Product> listProducts(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search == null || search.isEmpty()) {
            return productRepository.findAll(pageable);
        } else {
            return productRepository.findByNameContainingIgnoreCase(search, pageable);
        }
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Product update(Long id, Product updatedProduct) {
        Product existing = getById(id);
        existing.setName(updatedProduct.getName());
        existing.setPrice(updatedProduct.getPrice());

        // Atualiza a imagem se fornecida
        if (updatedProduct.getProductImage() != null) {
            existing.setProductImage(updatedProduct.getProductImage());
        }

        return productRepository.save(existing);
    }

    public Product updateWithImage(Long id, Product updatedProduct, MultipartFile image) {
        Product existing = getById(id);
        existing.setName(updatedProduct.getName());
        existing.setPrice(updatedProduct.getPrice());

        // Processa nova imagem se fornecida
        if (image != null && !image.isEmpty()) {
            String extension = FilenameUtils.getExtension(image.getOriginalFilename());
            String newFileName = UUID.randomUUID().toString() + "." + extension;

            String uploadDir = "/deskly-ecommerce-2/assets/images/";
            Path filePath = Paths.get(uploadDir, newFileName);
            try {
                Files.write(filePath, image.getBytes());
                existing.setProductImage(newFileName);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao salvar imagem", e);
            }
        }

        return productRepository.save(existing);
    }

    public void enableDisable(Long id, boolean active) {
        Product product = getById(id);
        product.setActive(active);
        productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = getById(id);
        productRepository.delete(product);
    }

    public void createProduct(ProductCreateDTO dto, List<MultipartFile> images) {

        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setRating(dto.getRating());
        product.setPrice(dto.getPrice());
        product.setActive(true);

        String mainImagePath = null;

        // Processa imagens apenas se foram fornecidas
        if (images != null && !images.isEmpty()) {
            int mainImageIndex = dto.getMainImageIndex() != null ? dto.getMainImageIndex() : 0;

            for (int i = 0; i < images.size(); i++) {

                MultipartFile file = images.get(i);
                String extension = FilenameUtils.getExtension(file.getOriginalFilename());
                String newFileName = UUID.randomUUID().toString() + "." + extension;

                String uploadDir = "/deskly-ecommerce-2/assets/images/";
                Path filePath = Paths.get(uploadDir, newFileName);
                try {
                    Files.write(filePath, file.getBytes());

                    // Define a imagem principal baseada no índice
                    if (i == mainImageIndex) {
                        mainImagePath = newFileName;
                    }
                } catch (IOException e) {
                    throw new RuntimeException("Erro ao salvar imagem", e);
                }

            }
        }

        // Define a imagem principal no produto
        product.setProductImage(mainImagePath);

        // Salva o produto
        Product savedProduct = productRepository.save(product);

        // Cria registro no estoque se quantidade foi informada
        if (dto.getQuantity() != null && dto.getQuantity() > 0) {
            Stock stock = new Stock();
            stock.setProduct(savedProduct);
            stock.setIdCatalog(savedProduct.getId());
            stock.setQuantity(dto.getQuantity());
            stockRepository.save(stock);
        }
    }

    public void createProductFromBase64(ProductCreateDTO dto) {
        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setRating(dto.getRating());
        product.setPrice(dto.getPrice());
        product.setActive(true);

        // Processa imagem base64 se foi fornecida
        if (dto.getImageBase64() != null && !dto.getImageBase64().isEmpty()) {
            String imagePath = saveBase64Image(dto.getImageBase64());
            product.setProductImage(imagePath);
        }

        // Salva o produto
        Product savedProduct = productRepository.save(product);

        // Cria registro no estoque se quantidade foi informada
        if (dto.getQuantity() != null && dto.getQuantity() > 0) {
            Stock stock = new Stock();
            stock.setProduct(savedProduct);
            stock.setIdCatalog(savedProduct.getId());
            stock.setQuantity(dto.getQuantity());
            stockRepository.save(stock);
        }
    }

    public Product updateFromBase64(Long id, ProductCreateDTO dto) {
        Product existing = getById(id);
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setRating(dto.getRating());
        existing.setPrice(dto.getPrice());

        // Processa imagem base64 se foi fornecida
        if (dto.getImageBase64() != null && !dto.getImageBase64().isEmpty()) {
            String imagePath = saveBase64Image(dto.getImageBase64());
            existing.setProductImage(imagePath);
        }

        return productRepository.save(existing);
    }

    private String saveBase64Image(String base64String) {
        try {
            // Remove o prefixo "data:image/...;base64," se existir
            String base64Data = base64String;
            if (base64String.contains(",")) {
                base64Data = base64String.split(",")[1];
            }

            // Decodifica o base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // Detecta a extensão da imagem pelo prefixo base64
            String extension = "png"; // padrão
            if (base64String.contains("data:image/")) {
                String mimeType = base64String.substring(
                    base64String.indexOf("data:image/") + 11,
                    base64String.indexOf(";")
                );
                extension = mimeType;
            }

            // Gera nome único para o arquivo
            String fileName = UUID.randomUUID().toString() + "." + extension;

            // Salva o arquivo
            String uploadDir = "/deskly-ecommerce-2/assets/images/";
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, imageBytes);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar imagem base64", e);
        }
    }

}
